import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        clerkId: string;
        email: string;
        name: string;
        plan: 'free' | 'premium' | 'pro';
    };
}
export interface RateLimitError extends Error {
    statusCode: number;
    remainingScans?: number;
    resetTime?: Date;
}
export declare const rateLimitMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserScanUsage: (clerkId: string) => Promise<{
    plan: "premium" | "pro";
    unlimited: boolean;
    currentScans: number;
    dailyLimit: null;
    remainingScans: null;
    resetTime: null;
} | {
    plan: "free";
    unlimited: boolean;
    currentScans: number;
    dailyLimit: number;
    remainingScans: number;
    resetTime: Date;
}>;
export declare const addScanUsageHeaders: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
declare global {
    namespace Express {
        interface Request {
            scanInfo?: {
                currentScans: number;
                dailyLimit: number;
                remainingScans: number;
                resetTime: Date;
            };
        }
    }
}
export {};
//# sourceMappingURL=rateLimitMiddleware.d.ts.map