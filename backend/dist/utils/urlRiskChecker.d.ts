export interface UrlRiskResult {
    verdict: 'SAFE' | 'DANGEROUS';
    virusTotalData: any;
    googleSafeBrowsingData: any;
}
export declare function checkUrlRisk(url: string): Promise<UrlRiskResult>;
//# sourceMappingURL=urlRiskChecker.d.ts.map