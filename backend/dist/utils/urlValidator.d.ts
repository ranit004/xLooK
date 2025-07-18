import { URL } from 'url';
export interface ValidationResult {
    isValid: boolean;
    error?: string;
    parsedUrl?: URL;
}
export declare const validateUrl: (urlString: string) => ValidationResult;
export declare const sanitizeUrl: (urlString: string) => string;
//# sourceMappingURL=urlValidator.d.ts.map