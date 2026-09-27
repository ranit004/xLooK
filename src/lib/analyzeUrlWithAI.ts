import Groq from "groq-sdk";

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Analyze a URL with AI using VirusTotal and Safe Browsing data.
 * Uses openai/gpt-oss-120b exclusively via Groq.
 */
export async function analyzeUrlWithAI(
  url: string,
  virusTotalData: { positives: number; total: number },
  safeBrowsingData: { threatsFound: boolean }
): Promise<{ aiVerdict: "DANGEROUS" | "SAFE"; reason: string }> {
  const sanitizedUrl = new URL(url).hostname;

  const prompt = `Analyze this URL for security threats.

Domain: ${sanitizedUrl}
VirusTotal scan: ${virusTotalData.positives} positives out of ${virusTotalData.total} engines
Google Safe Browsing: Threats found = ${safeBrowsingData.threatsFound}

Based on this data, determine if this URL is likely malicious, phishing, scam, or suspicious.

Respond in this exact format:
VERDICT: [DANGEROUS or SAFE]
REASON: [Brief explanation]`;

  try {
    console.log("Analyzing URL with openai/gpt-oss-120b via Groq...");

    const completion = await getGroq().chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are a cybersecurity expert. Analyze URLs for threats and respond in the exact format requested.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 256,
      temperature: 0.2,
    });

    const responseText = completion.choices[0]?.message?.content ?? "";

    // Parse structured response
    const verdictMatch = responseText.match(/VERDICT:\s*(DANGEROUS|SAFE)/i);
    const reasonMatch = responseText.match(/REASON:\s*(.+)/i);

    if (verdictMatch) {
      const aiVerdict =
        verdictMatch[1].toUpperCase() === "DANGEROUS" ? "DANGEROUS" : "SAFE";
      const reason =
        reasonMatch?.[1]?.trim() || responseText.trim() || "Analysis complete.";
      console.log(`GPT OSS 120B verdict: ${aiVerdict}`);
      return { aiVerdict, reason };
    }

    // Fallback parsing for unstructured responses
    const simpleMatch = responseText.match(/\b(DANGEROUS|SAFE)\b/i);
    if (simpleMatch) {
      const aiVerdict =
        simpleMatch[1].toUpperCase() === "DANGEROUS" ? "DANGEROUS" : "SAFE";
      const reason =
        responseText.replace(simpleMatch[0], "").trim() || "Analysis complete.";
      return { aiVerdict, reason };
    }

    throw new Error("Could not parse model response");
  } catch (error: any) {
    console.error("GPT OSS 120B analysis failed:", error.message);

    // Heuristic fallback if the API call itself fails
    if (virusTotalData.positives > 0 || safeBrowsingData.threatsFound) {
      return {
        aiVerdict: "DANGEROUS",
        reason: `Security scan detected ${virusTotalData.positives} threats. Exercise caution.`,
      };
    }

    return {
      aiVerdict: "SAFE",
      reason: "No threats detected by security scanners.",
    };
  }
}
