"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    PORT: process.env.PORT || 5000,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/urlSafety',
    VIRUSTOTAL_API_KEY: process.env.VIRUSTOTAL_API_KEY || '',
    GOOGLE_SAFE_BROWSING_API_KEY: process.env.GOOGLE_SAFE_BROWSING_API_KEY || '',
    IPINFO_API_KEY: process.env.IPINFO_API_KEY || '',
    VIRUSTOTAL_API_URL: process.env.VIRUSTOTAL_API_URL || 'https://www.virustotal.com/vtapi/v2',
    GOOGLE_SAFE_BROWSING_API_URL: process.env.GOOGLE_SAFE_BROWSING_API_URL || 'https://safebrowsing.googleapis.com/v4',
    IPINFO_API_URL: process.env.IPINFO_API_URL || 'https://ipinfo.io',
};
//# sourceMappingURL=env.js.map