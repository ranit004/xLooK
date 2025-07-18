"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUrl = exports.validateUrl = void 0;
const url_1 = require("url");
const validateUrl = (urlString) => {
    try {
        if (!urlString || typeof urlString !== 'string') {
            return {
                isValid: false,
                error: 'URL is required and must be a string'
            };
        }
        const trimmedUrl = urlString.trim();
        if (!trimmedUrl) {
            return {
                isValid: false,
                error: 'URL cannot be empty'
            };
        }
        const parsedUrl = new url_1.URL(trimmedUrl);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return {
                isValid: false,
                error: 'URL must use HTTP or HTTPS protocol'
            };
        }
        if (!parsedUrl.hostname) {
            return {
                isValid: false,
                error: 'URL must have a valid hostname'
            };
        }
        if (process.env.NODE_ENV === 'production') {
            const hostname = parsedUrl.hostname.toLowerCase();
            if (hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                hostname === '0.0.0.0' ||
                hostname.startsWith('192.168.') ||
                hostname.startsWith('10.') ||
                hostname.startsWith('172.')) {
                return {
                    isValid: false,
                    error: 'Private IP addresses and localhost are not allowed'
                };
            }
        }
        return {
            isValid: true,
            parsedUrl
        };
    }
    catch (error) {
        return {
            isValid: false,
            error: 'Invalid URL format'
        };
    }
};
exports.validateUrl = validateUrl;
const sanitizeUrl = (urlString) => {
    return urlString.trim().toLowerCase();
};
exports.sanitizeUrl = sanitizeUrl;
//# sourceMappingURL=urlValidator.js.map