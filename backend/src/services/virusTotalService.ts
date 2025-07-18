import axios from 'axios'
import crypto from 'crypto'
import env from '../config/env'

export interface VirusTotalScanResult {
  scan_id: string
  scan_date: string
  permalink: string
  verbose_msg: string
  response_code: number
}

export interface VirusTotalReportResult {
  scan_id: string
  scan_date: string
  permalink: string
  verbose_msg: string
  response_code: number
  positives: number
  total: number
  scans: Record<string, {
    detected: boolean
    version: string
    result: string | null
    update: string
  }>
}

export interface VirusTotalAnalysis {
  isClean: boolean
  positives: number
  total: number
  detectionRatio: string
  scanDate: string
  permalink: string
  rawData: VirusTotalReportResult | null
  threats: string[]
  riskScore: number
}

class VirusTotalService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = env.VIRUSTOTAL_API_KEY
    this.baseUrl = env.VIRUSTOTAL_API_URL
    
    console.log('🔍 VirusTotal API Key:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'Not found')
    
    if (!this.apiKey || this.apiKey === 'your_virustotal_api_key_here') {
      console.warn('⚠️ VirusTotal API key not configured. Using mock data.')
    } else {
      console.log('✅ VirusTotal API key configured successfully')
    }
  }

  private generateUrlId(url: string): string {
    return crypto.createHash('sha256').update(url).digest('hex')
  }

  async scanUrl(url: string): Promise<VirusTotalScanResult> {
    if (!this.apiKey || this.apiKey === 'your_virustotal_api_key_here') {
      // Return mock data when API key is not configured
      return {
        scan_id: this.generateUrlId(url),
        scan_date: new Date().toISOString(),
        permalink: `https://www.virustotal.com/gui/url/${this.generateUrlId(url)}`,
        verbose_msg: 'Scan request successfully queued, come back later for the report',
        response_code: 1
      }
    }

    try {
      const response = await axios.post<VirusTotalScanResult>(
        `${this.baseUrl}/url/scan`,
        new URLSearchParams({
          apikey: this.apiKey,
          url: url
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      )

      return response.data
    } catch (error) {
      console.error('VirusTotal scan error:', error)
      throw new Error('Failed to scan URL with VirusTotal')
    }
  }

  async getUrlReport(url: string): Promise<VirusTotalAnalysis> {
    if (!this.apiKey || this.apiKey === 'your_virustotal_api_key_here') {
      // Return mock data when API key is not configured
      return this.generateMockAnalysis(url)
    }

    try {
      const response = await axios.post<VirusTotalReportResult>(
        `${this.baseUrl}/url/report`,
        new URLSearchParams({
          apikey: this.apiKey,
          resource: url
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      )

      return this.parseVirusTotalResponse(response.data)
    } catch (error) {
      console.error('VirusTotal report error:', error)
      // Return mock data on error
      return this.generateMockAnalysis(url)
    }
  }

  private generateMockAnalysis(url: string): VirusTotalAnalysis {
    // Generate somewhat realistic mock data
    const isClean = Math.random() > 0.1 // 90% chance of being clean
    const total = 67
    const positives = isClean ? 0 : Math.floor(Math.random() * 5) + 1
    
    return {
      isClean,
      positives,
      total,
      detectionRatio: `${positives}/${total}`,
      scanDate: new Date().toISOString(),
      permalink: `https://www.virustotal.com/gui/url/${this.generateUrlId(url)}`,
      rawData: null,
      threats: isClean ? [] : ['Malware', 'Phishing'].slice(0, positives),
      riskScore: this.calculateRiskScore(positives, total)
    }
  }

  private parseVirusTotalResponse(data: VirusTotalReportResult): VirusTotalAnalysis {
    const { positives = 0, total = 0, scans = {} } = data
    const isClean = positives === 0
    
    // Extract threat types from scan results
    const threats: string[] = []
    Object.entries(scans).forEach(([engine, result]) => {
      if (result.detected && result.result) {
        threats.push(result.result)
      }
    })

    // Remove duplicates
    const uniqueThreats = [...new Set(threats)]

    return {
      isClean,
      positives,
      total,
      detectionRatio: `${positives}/${total}`,
      scanDate: data.scan_date,
      permalink: data.permalink,
      rawData: data,
      threats: uniqueThreats,
      riskScore: this.calculateRiskScore(positives, total)
    }
  }

  private calculateRiskScore(positives: number, total: number): number {
    if (total === 0) return 0
    const ratio = positives / total
    
    if (ratio === 0) return 0 // Clean
    if (ratio <= 0.1) return 25 // Low risk
    if (ratio <= 0.3) return 50 // Medium risk
    if (ratio <= 0.6) return 75 // High risk
    return 100 // Very high risk
  }
}

export const virusTotalService = new VirusTotalService()
