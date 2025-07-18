export interface Geolocation {
    ip: string;
    city?: string;
    region?: string;
    country?: string;
    loc?: string;
    org?: string;
    postal?: string;
    timezone?: string;
    rawData?: any;
}
export interface GeolocationAnalysis {
    isLocated: boolean;
    location: string;
    riskScore: number;
    details: string;
    data: Geolocation | null;
}
declare class IPinfoService {
    private apiKey;
    private baseUrl;
    constructor();
    getGeolocation(url: string): Promise<GeolocationAnalysis>;
    private parseGeolocationResponse;
    private generateMockGeolocation;
}
export declare const ipinfoService: IPinfoService;
export {};
//# sourceMappingURL=ipinfoService.d.ts.map