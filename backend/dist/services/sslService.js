"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sslService = void 0;
const tls_1 = __importDefault(require("tls"));
class SSLService {
    async checkSSLValidity(url) {
        try {
            const { host } = new URL(url);
            const socketOptions = {
                host,
                port: 443,
                servername: host,
                rejectUnauthorized: false
            };
            console.log(`🔒 Checking SSL certificate for: ${host}`);
            return new Promise((resolve, reject) => {
                const socket = tls_1.default.connect(socketOptions, () => {
                    const cert = socket.getPeerCertificate();
                    if (!cert || !Object.keys(cert).length) {
                        reject(new Error('No certificate found'));
                        return;
                    }
                    const expiresOn = cert.valid_to;
                    const issuedBy = cert.issuer?.O || null;
                    const issuedTo = cert.subject?.CN || null;
                    const valid = socket.authorized;
                    const daysUntilExpiration = this.calculateDaysUntilExpiration(expiresOn);
                    const riskScore = valid && daysUntilExpiration && daysUntilExpiration < 30 ? 20 : 0;
                    let details = 'SSL certificate is valid.';
                    if (!valid) {
                        details = 'SSL certificate is invalid or self-signed.';
                    }
                    else if (daysUntilExpiration !== null && daysUntilExpiration < 30) {
                        details = 'SSL certificate is expiring soon!';
                    }
                    socket.end();
                    resolve({
                        valid,
                        expiresOn,
                        issuedBy,
                        issuedTo,
                        daysUntilExpiration,
                        riskScore,
                        details
                    });
                });
                socket.on('error', (err) => {
                    console.error('SSL check error:', err);
                    reject(err);
                });
            });
        }
        catch (error) {
            console.error('SSL check setup error:', error);
            return {
                valid: false,
                expiresOn: null,
                issuedBy: null,
                issuedTo: null,
                daysUntilExpiration: null,
                riskScore: 50,
                details: 'Failed to check SSL certificate.'
            };
        }
    }
    calculateDaysUntilExpiration(date) {
        if (!date)
            return null;
        try {
            const expiration = new Date(date);
            const now = new Date();
            const diffTime = expiration.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }
        catch (e) {
            console.error('Error calculating SSL expiration date:', e);
            return null;
        }
    }
}
exports.sslService = new SSLService();
//# sourceMappingURL=sslService.js.map