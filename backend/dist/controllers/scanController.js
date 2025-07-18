"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScanById = exports.getScanStats = exports.getRecentScans = exports.getUrlHistory = void 0;
const Scan_1 = __importDefault(require("../models/Scan"));
const getUrlHistory = async (req, res) => {
    try {
        const { url } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        if (!url) {
            res.status(400).json({
                success: false,
                error: 'URL parameter is required'
            });
            return;
        }
        const scans = await Scan_1.default.find({ url })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('-__v')
            .exec();
        res.json({
            success: true,
            url,
            count: scans.length,
            scans
        });
    }
    catch (error) {
        console.error('Error fetching URL history:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getUrlHistory = getUrlHistory;
const getRecentScans = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const scans = await Scan_1.default.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('url result.securityAnalysis.riskAnalysis createdAt')
            .exec();
        const totalScans = await Scan_1.default.countDocuments();
        res.json({
            success: true,
            scans,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalScans / limit),
                totalScans,
                hasNext: page < Math.ceil(totalScans / limit),
                hasPrev: page > 1
            }
        });
    }
    catch (error) {
        console.error('Error fetching recent scans:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getRecentScans = getRecentScans;
const getScanStats = async (req, res) => {
    try {
        const stats = await Scan_1.default.aggregate([
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
        const totalScans = await Scan_1.default.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayScans = await Scan_1.default.countDocuments({
            createdAt: { $gte: today }
        });
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyScans = await Scan_1.default.countDocuments({
            createdAt: { $gte: last7Days }
        });
        const topUrls = await Scan_1.default.aggregate([
            {
                $group: {
                    _id: '$url',
                    count: { $sum: 1 },
                    lastScan: { $max: '$createdAt' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    url: '$_id',
                    scanCount: '$count',
                    lastScan: 1
                }
            }
        ]);
        res.json({
            success: true,
            stats: {
                total: totalScans,
                today: todayScans,
                lastWeek: weeklyScans,
                riskDistribution: stats,
                topUrls
            }
        });
    }
    catch (error) {
        console.error('Error fetching scan statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getScanStats = getScanStats;
const getScanById = async (req, res) => {
    try {
        const { id } = req.params;
        const scan = await Scan_1.default.findById(id).select('-__v').exec();
        if (!scan) {
            res.status(404).json({
                success: false,
                error: 'Scan not found'
            });
            return;
        }
        res.json({
            success: true,
            scan
        });
    }
    catch (error) {
        console.error('Error fetching scan:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getScanById = getScanById;
//# sourceMappingURL=scanController.js.map