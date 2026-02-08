import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getGemini(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// Helper function to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  const prompt = `Analyze this URL for security threats.

Domain: ${sanitizedUrl}
VirusTotal scan: ${virusTotalData.positives} positives out of ${virusTotalData.total} engines
Google Safe Browsing: Threats found = ${safeBrowsingData.threatsFound}

Based on this data, determine if this URL is likely malicious, phishing, scam, or suspicious.

Respond in this exact format:
VERDICT: [DANGEROUS or SAFE]
REASON: [Brief explanation]`;

  async function callGemini(modelName: string, retries = 2): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const model = getGemini().getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        console.error(`Gemini ${modelName} attempt ${attempt + 1} failed:`, error.message);

        // Check for rate limit errors and retry after delay
        if (error.message?.includes("429") || error.message?.includes("retry") || error.message?.includes("RESOURCE_EXHAUSTED")) {
          if (attempt < retries) {
            console.log(`Rate limited, waiting 5 seconds before retry...`);
            await delay(5000);
            continue;
          }
        }
        throw error;
      }
    }
    throw new Error("All retries exhausted");
  }

  // Models to try in order - gemma models have separate quota limits
  const models = ["gemma-3-12b-it", "gemini-2.0-flash-001", "gemini-2.5-flash-preview-05-20"];

  for (const modelName of models) {
    try {
      console.log(`Trying AI analysis with model: ${modelName}`);
      const responseText = await callGemini(modelName);

      // Parse response
      const verdictMatch = responseText.match(/VERDICT:\s*(DANGEROUS|SAFE)/i);
      const reasonMatch = responseText.match(/REASON:\s*(.+)/i);

      if (verdictMatch) {
        const aiVerdict = verdictMatch[1].toUpperCase() === "DANGEROUS" ? "DANGEROUS" : "SAFE";
        const reason = reasonMatch?.[1]?.trim() || responseText.trim() || "Analysis complete.";
        console.log(`AI Analysis success: ${aiVerdict}`);
        return { aiVerdict, reason };
      }

      // Fallback parsing for unstructured responses
      const simpleMatch = responseText.match(/\b(DANGEROUS|SAFE)\b/i);
      if (simpleMatch) {
        const aiVerdict = simpleMatch[1].toUpperCase() === "DANGEROUS" ? "DANGEROUS" : "SAFE";
        const reason = responseText.replace(simpleMatch[0], "").trim() || "Analysis complete.";
        return { aiVerdict, reason };
      }

      console.log(`Model ${modelName} returned unparseable response, trying next model...`);
    } catch (error: any) {
      console.error(`Model ${modelName} failed:`, error.message);
      // Continue to next model
    }
  }

  // All models failed - provide a heuristic-based fallback
  console.log("All AI models failed, using heuristic analysis");

  // Use VirusTotal and Safe Browsing data for heuristic verdict
  if (virusTotalData.positives > 0 || safeBrowsingData.threatsFound) {
    return {
      aiVerdict: "DANGEROUS",
      reason: `Security scan detected ${virusTotalData.positives} threats. Exercise caution.`
    };
  }

  return {
    aiVerdict: "SAFE",
    reason: "No threats detected by security scanners."
  };
}
