export interface GoogleSafeBrowsingResult {
    matches: Array<{
        threatType: string;
        platformType: string;
        threatEntryType: string;
        threat: {
            url: string;
        };
        cacheDuration: string;
        threatEntryMetadata: {
            entries: Array<{
                key: string;
                value: string;
            }>;
        };
        threatSeverity: string;
    }> | null;
}
export interface SafeBrowsingAnalysis {
    isSafe: boolean;
    threats: string[];
    rawData: GoogleSafeBrowsingResult | null;
    details: string;
    riskScore: number;
}
declare class GoogleSafeBrowsingService {
    private apiKey;
    private baseUrl;
    constructor();
    checkUrl(url: string): Promise<SafeBrowsingAnalysis>;
    private generateMockAnalysis;
    private parseSafeBrowsingResponse;
}
export declare const googleSafeBrowsingService: GoogleSafeBrowsingService;
export {};
//# sourceMappingURL=googleSafeBrowsingService.d.ts.map