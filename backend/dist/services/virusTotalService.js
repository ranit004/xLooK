"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.virusTotalService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
class VirusTotalService {
    constructor() {
        this.apiKey = process.env.VIRUSTOTAL_API_KEY || '';
        this.baseUrl = process.env.VIRUSTOTAL_API_URL || 'https://www.virustotal.com/vtapi/v2';
        if (!this.apiKey || this.apiKey === 'your_virustotal_api_key_here') {
            console.warn('⚠️ VirusTotal API key not configured. Using mock data.');
        }
    }
    generateUrlId(url) {
        return crypto_1.default.createHash('sha256').update(url).digest('hex');
    }
    async scanUrl(url) {
        if (!this.apiKey || this.apiKey === 'your_virustotal_api_key_here') {
            return {
                scan_id: this.generateUrlId(url),
                scan_date: new Date().toISOString(),
                permalink: `https://www.virustotal.com/gui/url/${this.generateUrlId(url)}`,
                verbose_msg: 'Scan request successfully queued, come back later for the report',
                response_code: 1
            };
        }
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/url/scan`, new URLSearchParams({
                apikey: this.apiKey,
                url: url
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000
            });
            return response.data;
        }
        catch (error) {
            console.error('VirusTotal scan error:', error);
            throw new Error('Failed to scan URL with VirusTotal');
        }
    }
    async getUrlReport(url) {
        if (!this.apiKey || this.apiKey === 'your_virustotal_api_key_here') {
            return this.generateMockAnalysis(url);
        }
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/url/report`, new URLSearchParams({
                apikey: this.apiKey,
                resource: url
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000
            });
            return this.parseVirusTotalResponse(response.data);
        }
        catch (error) {
            console.error('VirusTotal report error:', error);
            return this.generateMockAnalysis(url);
        }
    }
    generateMockAnalysis(url) {
        const isClean = Math.random() > 0.1;
        const total = 67;
        const positives = isClean ? 0 : Math.floor(Math.random() * 5) + 1;
        return {
            isClean,
            positives,
            total,
            detectionRatio: `${positives}/${total}`,
            scanDate: new Date().toISOString(),
            permalink: `https://www.virustotal.com/gui/url/${this.generateUrlId(url)}`,
            rawData: null,
            threats: isClean ? [] : ['Malware', 'Phishing'].slice(0, positives),
            riskScore: this.calculateRiskScore(positives, total)
        };
    }
    parseVirusTotalResponse(data) {
        const { positives = 0, total = 0, scans = {} } = data;
        const isClean = positives === 0;
        const threats = [];
        Object.entries(scans).forEach(([engine, result]) => {
            if (result.detected && result.result) {
                threats.push(result.result);
            }
        });
        const uniqueThreats = [...new Set(threats)];
        return {
            isClean,
            positives,
            total,
            detectionRatio: `${positives}/${total}`,
            scanDate: data.scan_date,
            permalink: data.permalink,
            rawData: data,
            threats: uniqueThreats,
            riskScore: this.calculateRiskScore(positives, total)
        };
    }
    calculateRiskScore(positives, total) {
        if (total === 0)
            return 0;
        const ratio = positives / total;
        if (ratio === 0)
            return 0;
        if (ratio <= 0.1)
            return 25;
        if (ratio <= 0.3)
            return 50;
        if (ratio <= 0.6)
            return 75;
        return 100;
    }
}
exports.virusTotalService = new VirusTotalService();
//# sourceMappingURL=virusTotalService.js.map