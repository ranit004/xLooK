import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import env from './config/env'
import { urlRoutes } from './routes/urlRoutes'
import { errorHandler } from './middleware/errorHandler'
import connectToMongoDB from './db/mongoConnection'

// Debug: Check if environment variables are loaded
console.log('🔧 Environment variables loaded:')
console.log('  PORT:', env.PORT)
console.log('  ALLOWED_ORIGIN:', env.ALLOWED_ORIGIN)
console.log('  VIRUSTOTAL_API_KEY:', env.VIRUSTOTAL_API_KEY ? `${env.VIRUSTOTAL_API_KEY.substring(0, 8)}...` : 'Not found')
console.log('  GOOGLE_SAFE_BROWSING_API_KEY:', env.GOOGLE_SAFE_BROWSING_API_KEY ? `${env.GOOGLE_SAFE_BROWSING_API_KEY.substring(0, 8)}...` : 'Not found')
console.log('  IPINFO_API_KEY:', env.IPINFO_API_KEY ? `${env.IPINFO_API_KEY.substring(0, 8)}...` : 'Not found')

const app = express()
const PORT = env.PORT
const ALLOWED_ORIGIN = env.ALLOWED_ORIGIN

// Middleware
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.use('/api', urlRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Error handling middleware
app.use(errorHandler)

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Try to connect to MongoDB, but don't fail if it's not available
    try {
      await connectToMongoDB()
      console.log(`🍃 MongoDB connected successfully`)
    } catch (dbError) {
      console.warn('⚠️ MongoDB connection failed, running without database:', dbError)
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 CORS enabled for: ${ALLOWED_ORIGIN}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Start the application
startServer()

export default app
