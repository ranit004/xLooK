"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskAnalyzer = void 0;
class RiskAnalyzer {
    analyzeRisk(virusTotalData, safeBrowsingData) {
        const reasons = [];
        let totalRiskScore = 0;
        let confidence = 100;
        if (!virusTotalData.isClean) {
            const vtWeight = 0.6;
            totalRiskScore += virusTotalData.riskScore * vtWeight;
            reasons.push(`VirusTotal detected ${virusTotalData.positives}/${virusTotalData.total} threats`);
            if (virusTotalData.threats.length > 0) {
                reasons.push(`Threat types: ${virusTotalData.threats.join(', ')}`);
            }
        }
        else {
            reasons.push(`VirusTotal: Clean (${virusTotalData.detectionRatio})`);
        }
        if (!safeBrowsingData.isSafe) {
            const gsbWeight = 0.4;
            totalRiskScore += safeBrowsingData.riskScore * gsbWeight;
            reasons.push('Google Safe Browsing flagged this URL');
            if (safeBrowsingData.threats.length > 0) {
                reasons.push(`Safe Browsing threats: ${safeBrowsingData.threats.join(', ')}`);
            }
        }
        else {
            reasons.push('Google Safe Browsing: No threats detected');
        }
        let overallRisk;
        let summary;
        if (totalRiskScore === 0) {
            overallRisk = 'safe';
            summary = 'URL appears to be safe based on security scans';
        }
        else if (totalRiskScore < 25) {
            overallRisk = 'warning';
            summary = 'URL has low risk indicators - exercise caution';
        }
        else if (totalRiskScore < 60) {
            overallRisk = 'warning';
            summary = 'URL has moderate risk indicators - be careful';
        }
        else {
            overallRisk = 'unsafe';
            summary = 'URL is flagged as potentially dangerous';
        }
        if (virusTotalData.rawData === null && safeBrowsingData.rawData === null) {
            confidence = 50;
            reasons.push('Note: Using simulated data (API keys not configured)');
        }
        return {
            overallRisk,
            riskScore: Math.round(totalRiskScore),
            reasons,
            confidence,
            summary
        };
    }
    async analyzeCombinedSecurity(virusTotalData, safeBrowsingData, whoisData, sslData, redirectsData, geolocationData) {
        const reasons = [];
        let totalRiskScore = 0;
        const appendReasons = (reason) => {
            if (!reasons.includes(reason)) {
                reasons.push(reason);
            }
        };
        const addRisk = (risk, reason) => {
            totalRiskScore += risk;
            appendReasons(reason);
        };
        if (!virusTotalData.isClean) {
            addRisk(virusTotalData.riskScore * 0.4, `VirusTotal: Detected threats (${virusTotalData.positives}/${virusTotalData.total})`);
        }
        else {
            appendReasons(`VirusTotal: No threats detected`);
        }
        if (!safeBrowsingData.isSafe) {
            addRisk(safeBrowsingData.riskScore * 0.2, `Google Safe Browsing: Detected threats`);
        }
        else {
            appendReasons(`Google Safe Browsing: No threats detected`);
        }
        if (!whoisData.isAvailable) {
            addRisk(whoisData.riskScore * 0.1, `WHOIS: ${whoisData.details}`);
        }
        else {
            appendReasons(`WHOIS: ${whoisData.details}`);
        }
        if (!sslData.valid) {
            addRisk(sslData.riskScore * 0.1, `SSL: ${sslData.details}`);
        }
        else {
            appendReasons(`SSL: ${sslData.details}`);
        }
        if (redirectsData.totalRedirects > 0) {
            addRisk(redirectsData.riskScore * 0.1, `Redirects: ${redirectsData.details}`);
        }
        else {
            appendReasons(`Redirects: ${redirectsData.details}`);
        }
        if (geolocationData.isLocated) {
            appendReasons(`Geolocation: ${geolocationData.details}`);
        }
        const riskAnalysis = {
            overallRisk: (totalRiskScore > 60 ? 'unsafe' : totalRiskScore > 30 ? 'warning' : 'safe'),
            riskScore: Math.round(totalRiskScore),
            reasons,
            confidence: virusTotalData.rawData && safeBrowsingData.rawData ? 100 : 80,
            summary: totalRiskScore > 60 ? 'High risk detected' : totalRiskScore > 30 ? 'Moderate risk, proceed with caution' : 'Low risk, appears safe'
        };
        return {
            riskAnalysis,
            virusTotal: virusTotalData,
            safeBrowsing: safeBrowsingData,
            whois: whoisData,
            ssl: sslData,
            redirects: redirectsData,
            geolocation: geolocationData,
            checkedAt: new Date().toISOString()
        };
    }
}
exports.riskAnalyzer = new RiskAnalyzer();
//# sourceMappingURL=riskAnalyzer.js.map