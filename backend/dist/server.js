"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const env_1 = __importDefault(require("./config/env"));
const urlRoutes_1 = require("./routes/urlRoutes");
const errorHandler_1 = require("./middleware/errorHandler");
const mongoConnection_1 = __importDefault(require("./db/mongoConnection"));
console.log('🔧 Environment variables loaded:');
console.log('  PORT:', env_1.default.PORT);
console.log('  ALLOWED_ORIGIN:', env_1.default.ALLOWED_ORIGIN);
console.log('  VIRUSTOTAL_API_KEY:', env_1.default.VIRUSTOTAL_API_KEY ? `${env_1.default.VIRUSTOTAL_API_KEY.substring(0, 8)}...` : 'Not found');
console.log('  GOOGLE_SAFE_BROWSING_API_KEY:', env_1.default.GOOGLE_SAFE_BROWSING_API_KEY ? `${env_1.default.GOOGLE_SAFE_BROWSING_API_KEY.substring(0, 8)}...` : 'Not found');
console.log('  IPINFO_API_KEY:', env_1.default.IPINFO_API_KEY ? `${env_1.default.IPINFO_API_KEY.substring(0, 8)}...` : 'Not found');
const app = (0, express_1.default)();
const PORT = env_1.default.PORT;
const ALLOWED_ORIGIN = env_1.default.ALLOWED_ORIGIN;
app.use((0, cors_1.default)({
    origin: ALLOWED_ORIGIN,
    credentials: true
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/api', urlRoutes_1.urlRoutes);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        try {
            await (0, mongoConnection_1.default)();
            console.log(`🍃 MongoDB connected successfully`);
        }
        catch (dbError) {
            console.warn('⚠️ MongoDB connection failed, running without database:', dbError);
        }
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 CORS enabled for: ${ALLOWED_ORIGIN}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map