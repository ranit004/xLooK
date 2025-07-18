export interface WhoisData {
    domain: string;
    registrar?: string;
    registrationDate?: string;
    expirationDate?: string;
    nameServers?: string[];
    status?: string[];
    rawData?: string;
}
export interface WhoisAnalysis {
    isAvailable: boolean;
    domainAge: number | null;
    daysUntilExpiration: number | null;
    registrar: string | null;
    riskScore: number;
    details: string;
    data: WhoisData | null;
}
declare class WhoisService {
    lookupDomain(url: string): Promise<WhoisAnalysis>;
    private performWhoisLookup;
    private analyzeWhoisData;
    private parseWhoisData;
    private extractValue;
    private calculateDomainAge;
    private calculateDaysUntilExpiration;
    private generateMockWhoisAnalysis;
}
export declare const whoisService: WhoisService;
export {};
//# sourceMappingURL=whoisService.d.ts.map