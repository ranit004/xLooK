export interface RedirectStep {
    url: string;
    statusCode: number;
    timestamp: string;
}
export interface RedirectAnalysis {
    redirectChain: RedirectStep[];
    finalUrl: string;
    totalRedirects: number;
    hasSuspiciousRedirects: boolean;
    riskScore: number;
    details: string;
}
declare class RedirectService {
    analyzeRedirectChain(url: string): Promise<RedirectAnalysis>;
    private analyzeRedirects;
    private generateMockRedirectAnalysis;
}
export declare const redirectService: RedirectService;
export {};
//# sourceMappingURL=redirectService.d.ts.map