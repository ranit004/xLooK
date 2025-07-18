"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addScanUsageHeaders = exports.getUserScanUsage = exports.rateLimitMiddleware = void 0;
const User_1 = __importDefault(require("../models/User"));
const Scan_1 = __importDefault(require("../models/Scan"));
const rateLimitMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user.clerkId) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'You must be logged in to perform URL scans'
            });
            return;
        }
        const { clerkId, plan } = req.user;
        if (plan === 'premium' || plan === 'pro') {
            next();
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayScansCount = await Scan_1.default.countDocuments({
            clerkId,
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });
        const DAILY_LIMIT = 10;
        const remainingScans = DAILY_LIMIT - todayScansCount;
        if (todayScansCount >= DAILY_LIMIT) {
            res.status(429).json({
                error: 'Daily scan limit exceeded',
                message: `Free users are limited to ${DAILY_LIMIT} scans per day. Upgrade to premium for unlimited scans.`,
                currentScans: todayScansCount,
                dailyLimit: DAILY_LIMIT,
                remainingScans: 0,
                resetTime: tomorrow,
                upgradeUrl: '/upgrade'
            });
            return;
        }
        req.scanInfo = {
            currentScans: todayScansCount,
            dailyLimit: DAILY_LIMIT,
            remainingScans,
            resetTime: tomorrow
        };
        next();
    }
    catch (error) {
        console.error('Rate limit middleware error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Unable to check scan limits'
        });
    }
};
exports.rateLimitMiddleware = rateLimitMiddleware;
const getUserScanUsage = async (clerkId) => {
    try {
        const user = await User_1.default.findOne({ clerkId });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.plan === 'premium' || user.plan === 'pro') {
            return {
                plan: user.plan,
                unlimited: true,
                currentScans: 0,
                dailyLimit: null,
                remainingScans: null,
                resetTime: null
            };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayScansCount = await Scan_1.default.countDocuments({
            clerkId,
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });
        const DAILY_LIMIT = 10;
        const remainingScans = Math.max(0, DAILY_LIMIT - todayScansCount);
        return {
            plan: user.plan,
            unlimited: false,
            currentScans: todayScansCount,
            dailyLimit: DAILY_LIMIT,
            remainingScans,
            resetTime: tomorrow
        };
    }
    catch (error) {
        console.error('Error getting user scan usage:', error);
        throw error;
    }
};
exports.getUserScanUsage = getUserScanUsage;
const addScanUsageHeaders = async (req, res, next) => {
    try {
        if (req.user?.clerkId) {
            const usage = await (0, exports.getUserScanUsage)(req.user.clerkId);
            res.set({
                'X-Scan-Plan': usage.plan,
                'X-Scan-Unlimited': usage.unlimited.toString(),
                'X-Scan-Current': usage.currentScans?.toString() || '0',
                'X-Scan-Limit': usage.dailyLimit?.toString() || 'unlimited',
                'X-Scan-Remaining': usage.remainingScans?.toString() || 'unlimited',
                'X-Scan-Reset': usage.resetTime?.toISOString() || 'never'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error adding scan usage headers:', error);
        next();
    }
};
exports.addScanUsageHeaders = addScanUsageHeaders;
//# sourceMappingURL=rateLimitMiddleware.js.map