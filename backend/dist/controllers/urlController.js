"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUrl = void 0;
const urlValidator_1 = require("../utils/urlValidator");
const virusTotalService_1 = require("../services/virusTotalService");
const googleSafeBrowsingService_1 = require("../services/googleSafeBrowsingService");
const whoisService_1 = require("../services/whoisService");
const sslService_1 = require("../services/sslService");
const redirectService_1 = require("../services/redirectService");
const ipinfoService_1 = require("../services/ipinfoService");
const riskAnalyzer_1 = require("../services/riskAnalyzer");
const Scan_1 = __importDefault(require("../models/Scan"));
const checkUrl = async (req, res) => {
    try {
        const { url } = req.body;
        const validation = (0, urlValidator_1.validateUrl)(url);
        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                error: validation.error
            });
            return;
        }
        console.log(`🔍 Comprehensive URL check: ${url}`);
        const [virusTotalResult, safeBrowsingResult, whoisResult, sslResult, redirectResult, geolocationResult] = await Promise.all([
            virusTotalService_1.virusTotalService.getUrlReport(url),
            googleSafeBrowsingService_1.googleSafeBrowsingService.checkUrl(url),
            whoisService_1.whoisService.lookupDomain(url),
            url.startsWith('https') ? sslService_1.sslService.checkSSLValidity(url) : Promise.resolve({
                valid: false,
                expiresOn: null,
                issuedBy: null,
                issuedTo: null,
                daysUntilExpiration: null,
                riskScore: 20,
                details: 'No HTTPS connection'
            }),
            redirectService_1.redirectService.analyzeRedirectChain(url),
            ipinfoService_1.ipinfoService.getGeolocation(url)
        ]);
        const securityAnalysis = await riskAnalyzer_1.riskAnalyzer.analyzeCombinedSecurity(virusTotalResult, safeBrowsingResult, whoisResult, sslResult, redirectResult, geolocationResult);
        const results = generateResultsFromAnalysis(securityAnalysis, url);
        const responseData = {
            success: true,
            url: validation.parsedUrl?.toString(),
            results,
            securityAnalysis,
            checkedAt: new Date().toISOString()
        };
        try {
            const scanDocument = new Scan_1.default({
                url: validation.parsedUrl?.toString() || url,
                result: {
                    ...responseData,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent')
                }
            });
            await scanDocument.save();
            console.log(`💾 Scan result saved to database for: ${url}`);
        }
        catch (dbError) {
            console.error('❌ Error saving to database:', dbError);
        }
        res.json(responseData);
    }
    catch (error) {
        console.error('Error checking URL:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.checkUrl = checkUrl;
function generateResultsFromAnalysis(analysis, url) {
    const { riskAnalysis, virusTotal, safeBrowsing, whois, ssl, redirects, geolocation } = analysis;
    const mapRiskToStatus = (risk) => {
        switch (risk) {
            case 'safe': return 'safe';
            case 'warning': return 'warning';
            case 'unsafe': return 'danger';
            default: return 'warning';
        }
    };
    const results = [
        {
            id: 'overall',
            title: 'Overall Safety',
            description: riskAnalysis.summary,
            status: mapRiskToStatus(riskAnalysis.overallRisk),
            value: riskAnalysis.overallRisk.toUpperCase(),
            category: 'security',
            details: `Risk Score: ${riskAnalysis.riskScore}/100 • Confidence: ${riskAnalysis.confidence}%`
        },
        {
            id: 'virustotal',
            title: 'VirusTotal Scan',
            description: virusTotal.isClean
                ? `Clean - ${virusTotal.detectionRatio} security vendors flagged this URL`
                : `${virusTotal.positives} threats detected`,
            status: virusTotal.isClean ? 'safe' : 'danger',
            value: virusTotal.detectionRatio,
            category: 'security',
            details: virusTotal.threats.length > 0
                ? `Threats: ${virusTotal.threats.join(', ')} • ${virusTotal.permalink}`
                : `Scanned by ${virusTotal.total} engines • ${virusTotal.permalink}`
        },
        {
            id: 'safebrowsing',
            title: 'Google Safe Browsing',
            description: safeBrowsing.details,
            status: safeBrowsing.isSafe ? 'safe' : 'danger',
            value: safeBrowsing.isSafe ? 'Clean' : 'Threats Found',
            category: 'security',
            details: safeBrowsing.threats.length > 0
                ? `Threat types: ${safeBrowsing.threats.join(', ')}`
                : 'No malware or phishing detected'
        },
        {
            id: 'whois',
            title: 'WHOIS Information',
            description: whois.details,
            status: whois.isAvailable ? 'danger' : whois.riskScore > 20 ? 'warning' : 'safe',
            value: whois.domainAge ? `${Math.floor(whois.domainAge / 365)} years old` : 'Unknown',
            category: 'info',
            details: whois.registrar ? `Registrar: ${whois.registrar} • ${whois.details}` : whois.details
        },
        {
            id: 'ssl',
            title: 'SSL Certificate',
            description: ssl.details,
            status: ssl.valid ? (ssl.daysUntilExpiration && ssl.daysUntilExpiration < 30 ? 'warning' : 'safe') : 'danger',
            value: ssl.valid ? 'Valid' : 'Invalid',
            category: 'security',
            details: ssl.issuedBy
                ? `Issued by: ${ssl.issuedBy} • Expires: ${ssl.expiresOn}`
                : ssl.details
        },
        {
            id: 'redirects',
            title: 'Redirect Chain',
            description: redirects.details,
            status: redirects.hasSuspiciousRedirects ? 'warning' : 'safe',
            value: redirects.totalRedirects === 0 ? 'Direct' : `${redirects.totalRedirects} redirects`,
            category: 'technical',
            details: redirects.redirectChain.length > 1
                ? `Chain: ${redirects.redirectChain.map(r => r.url).join(' → ')}`
                : redirects.details
        },
        {
            id: 'geolocation',
            title: 'Server Location',
            description: geolocation.details,
            status: 'safe',
            value: geolocation.location,
            category: 'info',
            details: geolocation.data?.org
                ? `Organization: ${geolocation.data.org} • IP: ${geolocation.data.ip}`
                : geolocation.details
        }
    ];
    return results;
}
//# sourceMappingURL=urlController.js.map