import { OpenAI } from "openai";

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Analyze a URL with AI using VirusTotal and Safe Browsing data.
 * @param url The original URL (will be sanitized, not raw)
 * @param virusTotalData VirusTotal scan data (summary)
 * @param safeBrowsingData Google Safe Browsing data (summary)
 * @returns AI verdict and reason
 */
export async function analyzeUrlWithAI(
  url: string,
  virusTotalData: { positives: number; total: number },
  safeBrowsingData: { threatsFound: boolean }
): Promise<{ aiVerdict: "DANGEROUS" | "SAFE"; reason: string }> {
  // Sanitize URL to only include domain info to avoid raw URLs
  const urlObj = new URL(url);
  const sanitizedUrl = urlObj.hostname;

  // Compose prompt
  const prompt = `Given this URL domain: ${sanitizedUrl}
VirusTotal scan: ${virusTotalData.positives} positives out of ${virusTotalData.total} engines
Google Safe Browsing: Threats found = ${safeBrowsingData.threatsFound}

Is this URL likely:
- malicious
- phishing
- scam
- suspicious

Reply with one word verdict: 'DANGEROUS' or 'SAFE', plus a short reason.`;

async function callOpenAI(model: string) {
    const messages = [{
      role: "user" as const,
      content: prompt
    }];
    return getOpenAI().chat.completions.create({
      model,
      messages,
      temperature: 0,
      max_tokens: 100
    });
  }

  try {
    let completion = await callOpenAI("gpt-4o");

    let responseText = completion.choices[0]?.message?.content?.trim() ?? "";

    let [aiVerdictMatch] = responseText.match(/DANGEROUS|SAFE/i) || [];
    if (!aiVerdictMatch) {
      throw new Error("No valid verdict found in AI response");
    }
    const aiVerdict = aiVerdictMatch.toUpperCase() === "DANGEROUS" ? "DANGEROUS" : "SAFE";
    const reason = responseText.replace(aiVerdictMatch, "").trim() || "No reason provided.";

    return { aiVerdict, reason };
  } catch (error: any) {
    console.error("Initial AI analysis failed:", error);
    if (error.response) {
      console.error("OpenAI response error:", error.response.status, error.response.statusText, error.response.data);
    }

    try {
      const completion = await callOpenAI("gpt-4-turbo");
      const responseText = completion.choices[0]?.message?.content?.trim() ?? "";
      const [aiVerdictMatch] = responseText.match(/DANGEROUS|SAFE/i) || [];
      if (!aiVerdictMatch) {
        throw new Error("No valid verdict found in AI response for fallback model");
      }
      const aiVerdict = aiVerdictMatch.toUpperCase() === "DANGEROUS" ? "DANGEROUS" : "SAFE";
      const reason = responseText.replace(aiVerdictMatch, "").trim() || "No reason provided.";

      return { aiVerdict, reason };
    } catch (fallbackError: any) {
      console.error("Fallback AI analysis failed:", fallbackError);
      if (fallbackError.response) {
        console.error(
          "Fallback OpenAI response error:",
          fallbackError.response.status,
          fallbackError.response.statusText,
          fallbackError.response.data
        );
      }

      try {
        const completion = await callOpenAI("gpt-3.5-turbo");
        const responseText = completion.choices[0]?.message?.content?.trim() ?? "";
        const [aiVerdictMatch] = responseText.match(/DANGEROUS|SAFE/i) || [];
        if (!aiVerdictMatch) {
          throw new Error("No valid verdict found in AI response for final fallback model");
        }
        const aiVerdict = aiVerdictMatch.toUpperCase() === "DANGEROUS" ? "DANGEROUS" : "SAFE";
        const reason = responseText.replace(aiVerdictMatch, "").trim() || "No reason provided.";

        return { aiVerdict, reason };
      } catch (finalError) {
        console.error("Final fallback AI analysis failed:", finalError);
        return { aiVerdict: "SAFE", reason: "AI analysis unavailable due to errors." };
      }
    }
  }
}
