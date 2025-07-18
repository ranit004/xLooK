"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whoisService = void 0;
const whois = require('whois');
const url_1 = require("url");
class WhoisService {
    async lookupDomain(url) {
        try {
            const parsedUrl = new url_1.URL(url);
            const domain = parsedUrl.hostname;
            console.log(`🔍 WHOIS lookup for domain: ${domain}`);
            const whoisData = await this.performWhoisLookup(domain);
            return this.analyzeWhoisData(whoisData, domain);
        }
        catch (error) {
            console.error('WHOIS lookup error:', error);
            return this.generateMockWhoisAnalysis(url);
        }
    }
    performWhoisLookup(domain) {
        return new Promise((resolve, reject) => {
            whois.lookup(domain, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    analyzeWhoisData(rawData, domain) {
        const whoisData = this.parseWhoisData(rawData, domain);
        let riskScore = 0;
        let details = '';
        const domainAge = this.calculateDomainAge(whoisData.registrationDate);
        const daysUntilExpiration = this.calculateDaysUntilExpiration(whoisData.expirationDate);
        if (domainAge !== null) {
            if (domainAge < 30) {
                riskScore += 30;
                details += 'Very new domain (high risk). ';
            }
            else if (domainAge < 180) {
                riskScore += 15;
                details += 'New domain (moderate risk). ';
            }
            else if (domainAge > 365 * 2) {
                details += 'Established domain (low risk). ';
            }
        }
        if (daysUntilExpiration !== null) {
            if (daysUntilExpiration < 30) {
                riskScore += 20;
                details += 'Domain expires soon. ';
            }
            else if (daysUntilExpiration > 365) {
                details += 'Domain has long-term registration. ';
            }
        }
        if (rawData.toLowerCase().includes('privacy') || rawData.toLowerCase().includes('redacted')) {
            details += 'WHOIS privacy protection enabled. ';
        }
        const isAvailable = rawData.toLowerCase().includes('no match') || rawData.toLowerCase().includes('not found');
        if (isAvailable) {
            riskScore = 100;
            details = 'Domain is not registered (very high risk)';
        }
        return {
            isAvailable,
            domainAge,
            daysUntilExpiration,
            registrar: whoisData.registrar || null,
            riskScore,
            details: details.trim() || 'Domain information available',
            data: whoisData
        };
    }
    parseWhoisData(rawData, domain) {
        const lines = rawData.split('\n');
        const data = {
            domain,
            rawData
        };
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('registrar:') || lowerLine.includes('sponsoring registrar:')) {
                const value = this.extractValue(line);
                data.registrar = value || undefined;
            }
            if (lowerLine.includes('creation date:') || lowerLine.includes('created:') || lowerLine.includes('registered:')) {
                const value = this.extractValue(line);
                data.registrationDate = value || undefined;
            }
            if (lowerLine.includes('expiry date:') || lowerLine.includes('expires:') || lowerLine.includes('expiration:')) {
                const value = this.extractValue(line);
                data.expirationDate = value || undefined;
            }
            if (lowerLine.includes('name server:') || lowerLine.includes('nserver:')) {
                if (!data.nameServers)
                    data.nameServers = [];
                const ns = this.extractValue(line);
                if (ns)
                    data.nameServers.push(ns);
            }
            if (lowerLine.includes('status:') || lowerLine.includes('domain status:')) {
                if (!data.status)
                    data.status = [];
                const status = this.extractValue(line);
                if (status)
                    data.status.push(status);
            }
        }
        return data;
    }
    extractValue(line) {
        const parts = line.split(':');
        if (parts.length >= 2) {
            return parts.slice(1).join(':').trim();
        }
        return null;
    }
    calculateDomainAge(registrationDate) {
        if (!registrationDate)
            return null;
        try {
            const regDate = new Date(registrationDate);
            const now = new Date();
            const diffTime = now.getTime() - regDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : null;
        }
        catch {
            return null;
        }
    }
    calculateDaysUntilExpiration(expirationDate) {
        if (!expirationDate)
            return null;
        try {
            const expDate = new Date(expirationDate);
            const now = new Date();
            const diffTime = expDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }
        catch {
            return null;
        }
    }
    generateMockWhoisAnalysis(url) {
        const parsedUrl = new url_1.URL(url);
        const domain = parsedUrl.hostname;
        const domainAge = Math.floor(Math.random() * 1000) + 365;
        const daysUntilExpiration = Math.floor(Math.random() * 365) + 30;
        return {
            isAvailable: false,
            domainAge,
            daysUntilExpiration,
            registrar: 'Mock Registrar Inc.',
            riskScore: domainAge < 180 ? 15 : 0,
            details: `Domain age: ${Math.floor(domainAge / 365)} years (mock data)`,
            data: {
                domain,
                registrar: 'Mock Registrar Inc.',
                registrationDate: new Date(Date.now() - domainAge * 24 * 60 * 60 * 1000).toISOString(),
                expirationDate: new Date(Date.now() + daysUntilExpiration * 24 * 60 * 60 * 1000).toISOString(),
                nameServers: ['ns1.mockdns.com', 'ns2.mockdns.com'],
                status: ['clientTransferProhibited'],
                rawData: 'Mock WHOIS data (API not configured)'
            }
        };
    }
}
exports.whoisService = new WhoisService();
//# sourceMappingURL=whoisService.js.map