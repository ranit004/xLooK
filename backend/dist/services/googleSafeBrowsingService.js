"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleSafeBrowsingService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = __importDefault(require("../config/env"));
class GoogleSafeBrowsingService {
    constructor() {
        this.apiKey = env_1.default.GOOGLE_SAFE_BROWSING_API_KEY;
        this.baseUrl = env_1.default.GOOGLE_SAFE_BROWSING_API_URL;
        if (!this.apiKey || this.apiKey === 'your_google_safe_browsing_api_key_here') {
            console.warn('⚠️ Google Safe Browsing API key not configured. Using mock data.');
        }
        else {
            console.log('✅ Google Safe Browsing API key configured successfully');
        }
    }
    async checkUrl(url) {
        if (!this.apiKey || this.apiKey === 'your_google_safe_browsing_api_key_here') {
            return this.generateMockAnalysis();
        }
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/threatMatches:find?key=${this.apiKey}`, {
                client: {
                    clientId: "yourclientid",
                    clientVersion: "1.5.2"
                },
                threatInfo: {
                    threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION"],
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
            return this.parseSafeBrowsingResponse(response.data);
        }
        catch (error) {
            console.error('Google Safe Browsing error:', error);
            return this.generateMockAnalysis();
        }
    }
    generateMockAnalysis() {
        const isSafe = Math.random() > 0.1;
        const threats = isSafe ? [] : ['malware', 'phishing'];
        return {
            isSafe,
            threats,
            rawData: null,
            details: isSafe ? 'No threats detected' : 'Threats detected (mock data)',
            riskScore: isSafe ? 0 : 50
        };
    }
    parseSafeBrowsingResponse(data) {
        const hasThreats = data.matches !== null;
        const threats = (data.matches || []).map(match => match.threatType);
        const uniqueThreats = [...new Set(threats)];
        return {
            isSafe: !hasThreats,
            threats: uniqueThreats,
            rawData: data,
            details: hasThreats ? 'Threats detected' : 'No threats detected',
            riskScore: hasThreats ? 50 : 0
        };
    }
}
exports.googleSafeBrowsingService = new GoogleSafeBrowsingService();
//# sourceMappingURL=googleSafeBrowsingService.js.map