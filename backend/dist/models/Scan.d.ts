import mongoose, { Document } from 'mongoose';
import { CombinedSecurityAnalysis } from '../services/riskAnalyzer';
import { URLCheckResult } from '../controllers/urlController';
export interface IScan extends Document {
    url: string;
    result: {
        success: boolean;
        results: URLCheckResult[];
        securityAnalysis: CombinedSecurityAnalysis;
        checkedAt: string;
        ipAddress?: string;
        userAgent?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const Scan: mongoose.Model<IScan, {}, {}, {}, mongoose.Document<unknown, {}, IScan, {}> & IScan & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Scan;
//# sourceMappingURL=Scan.d.ts.map