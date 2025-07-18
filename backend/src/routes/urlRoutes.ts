import { Router } from 'express'
import { checkUrl, checkUrlRisk } from '../controllers/urlController'
import { getUrlHistory, getRecentScans, getScanStats, getScanById } from '../controllers/scanController'

const router = Router()

// URL checking
router.post('/check-url', checkUrlRisk)

// Scan history and statistics
router.get('/scans/recent', getRecentScans)
router.get('/scans/stats', getScanStats)
router.get('/scans/:id', getScanById)
router.get('/scans/url/:url', getUrlHistory)

export { router as urlRoutes }
