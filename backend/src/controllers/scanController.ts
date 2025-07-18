import { Request, Response } from 'express'
import Scan from '../models/Scan'

// Get recent scans for a specific URL
export const getUrlHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.params
    const limit = parseInt(req.query.limit as string) || 10
    
    if (!url) {
      res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      })
      return
    }
    
    const scans = await Scan.find({ url })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v')
      .exec()
    
    res.json({
      success: true,
      url,
      count: scans.length,
      scans
    })
    
  } catch (error) {
    console.error('Error fetching URL history:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Get all recent scans
export const getRecentScans = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit
    
    const scans = await Scan.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('url result.securityAnalysis.riskAnalysis createdAt')
      .exec()
    
    const totalScans = await Scan.countDocuments()
    
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
    })
    
  } catch (error) {
    console.error('Error fetching recent scans:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Get scan statistics
export const getScanStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Scan.aggregate([
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
    ])
    
    const totalScans = await Scan.countDocuments()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayScans = await Scan.countDocuments({
      createdAt: { $gte: today }
    })
    
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weeklyScans = await Scan.countDocuments({
      createdAt: { $gte: last7Days }
    })
    
    // Get most scanned URLs
    const topUrls = await Scan.aggregate([
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
    ])
    
    res.json({
      success: true,
      stats: {
        total: totalScans,
        today: todayScans,
        lastWeek: weeklyScans,
        riskDistribution: stats,
        topUrls
      }
    })
    
  } catch (error) {
    console.error('Error fetching scan statistics:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Get a specific scan by ID
export const getScanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    const scan = await Scan.findById(id).select('-__v').exec()
    
    if (!scan) {
      res.status(404).json({
        success: false,
        error: 'Scan not found'
      })
      return
    }
    
    res.json({
      success: true,
      scan
    })
    
  } catch (error) {
    console.error('Error fetching scan:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
