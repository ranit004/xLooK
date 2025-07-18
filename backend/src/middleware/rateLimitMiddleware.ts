import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Scan from '../models/Scan';

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

/**
 * Rate limiting middleware that enforces daily scan limits based on user plan
 * - Free users: 10 scans per day
 * - Premium/Pro users: unlimited scans
 */
export const rateLimitMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.clerkId) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to perform URL scans'
      });
      return;
    }

    const { clerkId, plan } = req.user;

    // Premium and Pro users have unlimited scans
    if (plan === 'premium' || plan === 'pro') {
      next();
      return;
    }

    // For free users, check daily scan limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count scans for today
    const todayScansCount = await Scan.countDocuments({
      clerkId,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const DAILY_LIMIT = 10;
    const remainingScans = DAILY_LIMIT - todayScansCount;

    // Check if user has exceeded daily limit
    if (todayScansCount >= DAILY_LIMIT) {
      res.status(429).json({
        error: 'Daily scan limit exceeded',
        message: `Free users are limited to ${DAILY_LIMIT} scans per day. Upgrade to premium for unlimited scans.`,
        currentScans: todayScansCount,
        dailyLimit: DAILY_LIMIT,
        remainingScans: 0,
        resetTime: tomorrow,
        upgradeUrl: '/upgrade' // You can customize this URL
      });
      return;
    }

    // Add scan count info to request for potential use in controllers
    req.scanInfo = {
      currentScans: todayScansCount,
      dailyLimit: DAILY_LIMIT,
      remainingScans,
      resetTime: tomorrow
    };

    next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to check scan limits'
    });
  }
};

/**
 * Helper function to get current scan usage for a user
 */
export const getUserScanUsage = async (clerkId: string) => {
  try {
    const user = await User.findOne({ clerkId });
    if (!user) {
      throw new Error('User not found');
    }

    // For premium/pro users, return unlimited usage info
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

    // For free users, calculate daily usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayScansCount = await Scan.countDocuments({
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
  } catch (error) {
    console.error('Error getting user scan usage:', error);
    throw error;
  }
};

/**
 * Middleware to add scan usage info to response headers
 */
export const addScanUsageHeaders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.clerkId) {
      const usage = await getUserScanUsage(req.user.clerkId);
      
      // Add usage info to response headers
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
  } catch (error) {
    // Don't fail the request if we can't add headers
    console.error('Error adding scan usage headers:', error);
    next();
  }
};

// Extend Request interface to include scan info
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
