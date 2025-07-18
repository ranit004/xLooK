export interface SSLAnalysis {
    valid: boolean;
    expiresOn: string | null;
    issuedBy: string | null;
    issuedTo: string | null;
    daysUntilExpiration: number | null;
    riskScore: number;
    details: string;
}
declare class SSLService {
    checkSSLValidity(url: string): Promise<SSLAnalysis>;
    private calculateDaysUntilExpiration;
}
export declare const sslService: SSLService;
export {};
//# sourceMappingURL=sslService.d.ts.map