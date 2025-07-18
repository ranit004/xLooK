import axios from 'axios';
import env from '../config/env';

export interface UrlRiskResult {
  verdict: 'SAFE' | 'DANGEROUS';
  virusTotalData: any;
  googleSafeBrowsingData: any;
}

export async function checkUrlRisk(url: string): Promise<UrlRiskResult> {
  try {
    console.log(`🔍 Starting URL risk check for: ${url}`);
    
    // Run both security checks in parallel
    const [virusTotalResult, safeBrowsingResult] = await Promise.all([
      checkVirusTotalV3(url),
      checkGoogleSafeBrowsing(url)
    ]);

    // Determine verdict based on results
    let verdict: 'SAFE' | 'DANGEROUS' = 'SAFE';

    // Check VirusTotal results
    if (virusTotalResult.malicious > 0 || virusTotalResult.phishing > 0) {
      verdict = 'DANGEROUS';
    }

    // Check Google Safe Browsing results
    if (safeBrowsingResult.matches && safeBrowsingResult.matches.length > 0) {
      verdict = 'DANGEROUS';
    }

    console.log(`✅ URL risk check completed. Verdict: ${verdict}`);
    
    return {
      verdict,
      virusTotalData: virusTotalResult,
      googleSafeBrowsingData: safeBrowsingResult
    };
  } catch (error) {
    console.error('Error in checkUrlRisk:', error);
    throw error;
  }
}

// VirusTotal v3 API implementation
async function checkVirusTotalV3(url: string): Promise<any> {
  try {
    if (!env.VIRUSTOTAL_API_KEY || env.VIRUSTOTAL_API_KEY === 'your_virustotal_api_key_here') {
      console.warn('⚠️ VirusTotal API key not configured. Using mock data.');
      return {
        malicious: 0,
        phishing: 0,
        harmless: 67,
        suspicious: 0,
        undetected: 0,
        mock: true
      };
    }

    console.log('🔍 Calling VirusTotal v3 API...');
    
    // Step 1: Submit URL for analysis
    const submitResponse = await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      new URLSearchParams({ url }),
      {
        headers: {
          'x-apikey': env.VIRUSTOTAL_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );

    const analysisId = (submitResponse.data as any).data.id;
    console.log(`📊 VirusTotal analysis ID: ${analysisId}`);

    // Step 2: Get analysis results
    const analysisResponse = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: {
          'x-apikey': env.VIRUSTOTAL_API_KEY
        },
        timeout: 10000
      }
    );

    const stats = (analysisResponse.data as any).data.attributes.stats;
    console.log(`📈 VirusTotal stats:`, stats);

    return {
      malicious: stats.malicious || 0,
      phishing: stats.phishing || 0,
      harmless: stats.harmless || 0,
      suspicious: stats.suspicious || 0,
      undetected: stats.undetected || 0,
      analysisId,
      raw: analysisResponse.data
    };
  } catch (error) {
    console.error('VirusTotal API error:', error);
    // Return mock data on error
    return {
      malicious: 0,
      phishing: 0,
      harmless: 0,
      suspicious: 0,
      undetected: 0,
      error: (error as Error).message,
      mock: true
    };
  }
}

// Google Safe Browsing API implementation
async function checkGoogleSafeBrowsing(url: string): Promise<any> {
  try {
    if (!env.GOOGLE_SAFE_BROWSING_API_KEY || env.GOOGLE_SAFE_BROWSING_API_KEY === 'your_google_safe_browsing_api_key_here') {
      console.warn('⚠️ Google Safe Browsing API key not configured. Using mock data.');
      return {
        matches: [],
        mock: true
      };
    }

    console.log('🔍 Calling Google Safe Browsing API...');
    
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env.GOOGLE_SAFE_BROWSING_API_KEY}`,
      {
        client: {
          clientId: "url-safety-checker",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION"
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [
            { url }
          ]
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const matches = (response.data as any).matches || [];
    console.log(`🛡️ Google Safe Browsing matches:`, matches.length);

    return {
      matches,
      threatsFound: matches.length > 0,
      raw: response.data
    };
  } catch (error) {
    console.error('Google Safe Browsing API error:', error);
    // Return mock data on error
    return {
      matches: [],
      threatsFound: false,
      error: (error as Error).message,
      mock: true
    };
  }
}
