import mongoose, { Document } from 'mongoose';
export interface IUrlCheckHistory extends Document {
    userId: string;
    url: string;
    domain: string;
    verdict: 'SAFE' | 'DANGEROUS' | 'WARNING';
    virusTotalData: {
        malicious: number;
        phishing: number;
        suspicious: number;
        harmless: number;
        undetected: number;
        total: number;
        permalink?: string;
    };
    googleSafeBrowsingData: {
        threatsFound: boolean;
        matches: any[];
    };
    results: any[];
    aiAnalysis: {
        verdict: 'SAFE' | 'DANGEROUS' | 'unavailable';
        reason: string;
    };
    checkedAt: Date;
    createdAt: Date;
}
declare const UrlCheckHistory: mongoose.Model<IUrlCheckHistory, {}, {}, {}, mongoose.Document<unknown, {}, IUrlCheckHistory, {}> & IUrlCheckHistory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default UrlCheckHistory;
//# sourceMappingURL=UrlCheckHistory.d.ts.map