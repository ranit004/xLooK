export interface VirusTotalScanResult {
    scan_id: string;
    scan_date: string;
    permalink: string;
    verbose_msg: string;
    response_code: number;
}
export interface VirusTotalReportResult {
    scan_id: string;
    scan_date: string;
    permalink: string;
    verbose_msg: string;
    response_code: number;
    positives: number;
    total: number;
    scans: Record<string, {
        detected: boolean;
        version: string;
        result: string | null;
        update: string;
    }>;
}
export interface VirusTotalAnalysis {
    isClean: boolean;
    positives: number;
    total: number;
    detectionRatio: string;
    scanDate: string;
    permalink: string;
    rawData: VirusTotalReportResult | null;
    threats: string[];
    riskScore: number;
}
declare class VirusTotalService {
    private apiKey;
    private baseUrl;
    constructor();
    private generateUrlId;
    scanUrl(url: string): Promise<VirusTotalScanResult>;
    getUrlReport(url: string): Promise<VirusTotalAnalysis>;
    private generateMockAnalysis;
    private parseVirusTotalResponse;
    private calculateRiskScore;
}
export declare const virusTotalService: VirusTotalService;
export {};
//# sourceMappingURL=virusTotalService.d.ts.map