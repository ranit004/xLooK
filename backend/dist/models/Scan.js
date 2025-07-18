"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const scanSchema = new mongoose_1.Schema({
    url: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    result: {
        success: {
            type: Boolean,
            required: true
        },
        results: [{
                id: { type: String, required: true },
                title: { type: String, required: true },
                description: { type: String, required: true },
                status: {
                    type: String,
                    enum: ['safe', 'warning', 'danger'],
                    required: true
                },
                details: String,
                value: String,
                category: {
                    type: String,
                    enum: ['security', 'info', 'technical']
                }
            }],
        securityAnalysis: {
            riskAnalysis: {
                overallRisk: {
                    type: String,
                    enum: ['safe', 'unsafe', 'warning'],
                    required: true
                },
                riskScore: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100
                },
                reasons: [String],
                confidence: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100
                },
                summary: {
                    type: String,
                    required: true
                }
            },
            virusTotal: mongoose_1.Schema.Types.Mixed,
            safeBrowsing: mongoose_1.Schema.Types.Mixed,
            whois: mongoose_1.Schema.Types.Mixed,
            ssl: mongoose_1.Schema.Types.Mixed,
            redirects: mongoose_1.Schema.Types.Mixed,
            geolocation: mongoose_1.Schema.Types.Mixed,
            checkedAt: {
                type: String,
                required: true
            }
        },
        checkedAt: {
            type: String,
            required: true
        },
        ipAddress: String,
        userAgent: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});
scanSchema.index({ url: 1, createdAt: -1 });
scanSchema.index({ 'result.securityAnalysis.riskAnalysis.overallRisk': 1 });
scanSchema.index({ createdAt: -1 });
scanSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj._id;
    delete obj.__v;
    return obj;
};
scanSchema.statics.findRecentScans = function (url, limit = 10) {
    return this.find({ url })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
};
scanSchema.statics.getScanStats = function () {
    return this.aggregate([
        {
            $group: {
                _id: '$result.securityAnalysis.riskAnalysis.overallRisk',
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                riskLevel: '$_id',
                count: 1
            }
        }
    ]);
};
const Scan = mongoose_1.default.model('Scan', scanSchema);
exports.default = Scan;
//# sourceMappingURL=Scan.js.map