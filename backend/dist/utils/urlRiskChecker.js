"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUrlRisk = checkUrlRisk;
const axios_1 = __importDefault(require("axios"));
const env_1 = __importDefault(require("../config/env"));
async function checkUrlRisk(url) {
    try {
        console.log(`🔍 Starting URL risk check for: ${url}`);
        const [virusTotalResult, safeBrowsingResult] = await Promise.all([
            checkVirusTotalV3(url),
            checkGoogleSafeBrowsing(url)
        ]);
        let verdict = 'SAFE';
        if (virusTotalResult.malicious > 0 || virusTotalResult.phishing > 0) {
            verdict = 'DANGEROUS';
        }
        if (safeBrowsingResult.matches && safeBrowsingResult.matches.length > 0) {
            verdict = 'DANGEROUS';
        }
        console.log(`✅ URL risk check completed. Verdict: ${verdict}`);
        return {
            verdict,
            virusTotalData: virusTotalResult,
            googleSafeBrowsingData: safeBrowsingResult
        };
    }
    catch (error) {
        console.error('Error in checkUrlRisk:', error);
        throw error;
    }
}
async function checkVirusTotalV3(url) {
    try {
        if (!env_1.default.VIRUSTOTAL_API_KEY || env_1.default.VIRUSTOTAL_API_KEY === 'your_virustotal_api_key_here') {
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
        const submitResponse = await axios_1.default.post('https://www.virustotal.com/api/v3/urls', new URLSearchParams({ url }), {
            headers: {
                'x-apikey': env_1.default.VIRUSTOTAL_API_KEY,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 10000
        });
        const analysisId = submitResponse.data.data.id;
        console.log(`📊 VirusTotal analysis ID: ${analysisId}`);
        const analysisResponse = await axios_1.default.get(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
            headers: {
                'x-apikey': env_1.default.VIRUSTOTAL_API_KEY
            },
            timeout: 10000
        });
        const stats = analysisResponse.data.data.attributes.stats;
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
    }
    catch (error) {
        console.error('VirusTotal API error:', error);
        return {
            malicious: 0,
            phishing: 0,
            harmless: 0,
            suspicious: 0,
            undetected: 0,
            error: error.message,
            mock: true
        };
    }
}
async function checkGoogleSafeBrowsing(url) {
    try {
        if (!env_1.default.GOOGLE_SAFE_BROWSING_API_KEY || env_1.default.GOOGLE_SAFE_BROWSING_API_KEY === 'your_google_safe_browsing_api_key_here') {
            console.warn('⚠️ Google Safe Browsing API key not configured. Using mock data.');
            return {
                matches: [],
                mock: true
            };
        }
        console.log('🔍 Calling Google Safe Browsing API...');
        const response = await axios_1.default.post(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env_1.default.GOOGLE_SAFE_BROWSING_API_KEY}`, {
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
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        const matches = response.data.matches || [];
        console.log(`🛡️ Google Safe Browsing matches:`, matches.length);
        return {
            matches,
            threatsFound: matches.length > 0,
            raw: response.data
        };
    }
    catch (error) {
        console.error('Google Safe Browsing API error:', error);
        return {
            matches: [],
            threatsFound: false,
            error: error.message,
            mock: true
        };
    }
}
//# sourceMappingURL=urlRiskChecker.js.map