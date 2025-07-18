import { VirusTotalAnalysis } from './virusTotalService';
import { SafeBrowsingAnalysis } from './googleSafeBrowsingService';
import { WhoisAnalysis } from './whoisService';
import { SSLAnalysis } from './sslService';
import { RedirectAnalysis } from './redirectService';
import { GeolocationAnalysis } from './ipinfoService';
export interface RiskAnalysis {
    overallRisk: 'safe' | 'unsafe' | 'warning';
    riskScore: number;
    reasons: string[];
    confidence: number;
    summary: string;
}
export interface CombinedSecurityAnalysis {
    riskAnalysis: RiskAnalysis;
    virusTotal: VirusTotalAnalysis;
    safeBrowsing: SafeBrowsingAnalysis;
    whois: WhoisAnalysis;
    ssl: SSLAnalysis;
    redirects: RedirectAnalysis;
    geolocation: GeolocationAnalysis;
    checkedAt: string;
}
declare class RiskAnalyzer {
    analyzeRisk(virusTotalData: VirusTotalAnalysis, safeBrowsingData: SafeBrowsingAnalysis): RiskAnalysis;
    analyzeCombinedSecurity(virusTotalData: VirusTotalAnalysis, safeBrowsingData: SafeBrowsingAnalysis, whoisData: WhoisAnalysis, sslData: SSLAnalysis, redirectsData: RedirectAnalysis, geolocationData: GeolocationAnalysis): Promise<CombinedSecurityAnalysis>;
}
export declare const riskAnalyzer: RiskAnalyzer;
export {};
//# sourceMappingURL=riskAnalyzer.d.ts.map