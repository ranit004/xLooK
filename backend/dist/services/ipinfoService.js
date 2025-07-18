"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipinfoService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = __importDefault(require("../config/env"));
class IPinfoService {
    constructor() {
        this.apiKey = env_1.default.IPINFO_API_KEY;
        this.baseUrl = env_1.default.IPINFO_API_URL;
        if (!this.apiKey || this.apiKey === 'your_ipinfo_api_key_here') {
            console.warn('⚠️ IPinfo API key not configured. Using mock data.');
        }
        else {
            console.log('✅ IPinfo API key configured successfully');
        }
    }
    async getGeolocation(url) {
        if (!this.apiKey || this.apiKey === 'your_ipinfo_api_key_here') {
            return this.generateMockGeolocation(url);
        }
        try {
            const { host } = new URL(url);
            const response = await axios_1.default.get(`${this.baseUrl}/${host}?token=${this.apiKey}`, {
                timeout: 10000
            });
            return this.parseGeolocationResponse(response.data);
        }
        catch (error) {
            console.error('IPinfo error:', error);
            return this.generateMockGeolocation(url);
        }
    }
    parseGeolocationResponse(data) {
        const locationDetails = [];
        if (data.city)
            locationDetails.push(data.city);
        if (data.region)
            locationDetails.push(data.region);
        if (data.country)
            locationDetails.push(data.country);
        return {
            isLocated: true,
            location: locationDetails.join(', '),
            riskScore: 0,
            details: 'Geolocation data retrieved successfully',
            data,
        };
    }
    generateMockGeolocation(url) {
        const mockLocation = 'San Francisco, CA, US';
        return {
            isLocated: true,
            location: mockLocation,
            riskScore: 0,
            details: 'Mock geolocation data used (API not configured)',
            data: {
                ip: '93.184.216.34',
                city: 'San Francisco',
                region: 'CA',
                country: 'US',
                loc: '37.7749,-122.4194',
                org: 'Mock Organization',
                postal: '94107',
                timezone: 'America/Los_Angeles',
                rawData: 'Mock IPinfo data (API not configured)'
            }
        };
    }
}
exports.ipinfoService = new IPinfoService();
//# sourceMappingURL=ipinfoService.js.map