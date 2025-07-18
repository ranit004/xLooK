"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class RedirectService {
    async analyzeRedirectChain(url) {
        let browser;
        try {
            console.log(`🔄 Analyzing redirect chain for: ${url}`);
            browser = await puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            const page = await browser.newPage();
            const redirectChain = [];
            page.on('response', (response) => {
                const status = response.status();
                const responseUrl = response.url();
                if (status >= 300 && status < 400) {
                    redirectChain.push({
                        url: responseUrl,
                        statusCode: status,
                        timestamp: new Date().toISOString()
                    });
                }
            });
            page.setDefaultTimeout(10000);
            const response = await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 10000
            });
            const finalUrl = page.url();
            if (redirectChain.length > 0) {
                redirectChain.unshift({
                    url: url,
                    statusCode: response?.status() || 200,
                    timestamp: new Date().toISOString()
                });
            }
            if (finalUrl !== url && redirectChain.length > 0) {
                redirectChain.push({
                    url: finalUrl,
                    statusCode: 200,
                    timestamp: new Date().toISOString()
                });
            }
            await browser.close();
            return this.analyzeRedirects(redirectChain, finalUrl, url);
        }
        catch (error) {
            console.error('Redirect analysis error:', error);
            if (browser) {
                await browser.close();
            }
            return this.generateMockRedirectAnalysis(url);
        }
    }
    analyzeRedirects(redirectChain, finalUrl, originalUrl) {
        const totalRedirects = redirectChain.length;
        let riskScore = 0;
        let details = '';
        let hasSuspiciousRedirects = false;
        if (totalRedirects === 0) {
            details = 'No redirects detected - direct connection';
        }
        else if (totalRedirects === 1) {
            details = 'Single redirect detected';
        }
        else {
            details = `${totalRedirects} redirects detected`;
            if (totalRedirects > 3) {
                riskScore += 20;
                hasSuspiciousRedirects = true;
                details += ' (multiple redirects - potentially suspicious)';
            }
        }
        for (const step of redirectChain) {
            const stepUrl = step.url.toLowerCase();
            if (stepUrl.includes('bit.ly') ||
                stepUrl.includes('tinyurl') ||
                stepUrl.includes('t.co') ||
                stepUrl.includes('short') ||
                stepUrl.includes('redirect')) {
                riskScore += 15;
                hasSuspiciousRedirects = true;
                details += ' (contains URL shorteners or suspicious domains)';
                break;
            }
            const originalDomain = new URL(originalUrl).hostname;
            try {
                const stepDomain = new URL(step.url).hostname;
                if (originalDomain !== stepDomain) {
                    riskScore += 10;
                    details += ' (redirects to different domain)';
                }
            }
            catch {
            }
        }
        return {
            redirectChain: redirectChain.length > 0 ? redirectChain : [{ url: originalUrl, statusCode: 200, timestamp: new Date().toISOString() }],
            finalUrl,
            totalRedirects,
            hasSuspiciousRedirects,
            riskScore,
            details
        };
    }
    generateMockRedirectAnalysis(url) {
        const hasRedirect = Math.random() > 0.7;
        if (hasRedirect) {
            const redirectChain = [
                {
                    url: url,
                    statusCode: 301,
                    timestamp: new Date().toISOString()
                },
                {
                    url: url.replace('http://', 'https://'),
                    statusCode: 200,
                    timestamp: new Date().toISOString()
                }
            ];
            return {
                redirectChain,
                finalUrl: url.replace('http://', 'https://'),
                totalRedirects: 2,
                hasSuspiciousRedirects: false,
                riskScore: 0,
                details: 'HTTP to HTTPS redirect (mock data)'
            };
        }
        else {
            return {
                redirectChain: [{ url, statusCode: 200, timestamp: new Date().toISOString() }],
                finalUrl: url,
                totalRedirects: 0,
                hasSuspiciousRedirects: false,
                riskScore: 0,
                details: 'No redirects detected (mock data)'
            };
        }
    }
}
exports.redirectService = new RedirectService();
//# sourceMappingURL=redirectService.js.map