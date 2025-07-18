import { Request, Response } from 'express';
export interface URLCheckResult {
    id: string;
    title: string;
    description: string;
    status: 'safe' | 'warning' | 'danger';
    details?: string;
    value?: string;
    category?: 'security' | 'info' | 'technical';
}
export declare const checkUrl: (req: Request, res: Response) => Promise<void>;
export declare const checkUrlRisk: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=urlController.d.ts.map