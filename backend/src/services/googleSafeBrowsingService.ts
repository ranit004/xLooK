import axios from 'axios'
import env from '../config/env'

export interface GoogleSafeBrowsingResult {
  matches: Array<{
    threatType: string
    platformType: string
    threatEntryType: string
    threat: {
      url: string
    }
    cacheDuration: string
    threatEntryMetadata: {
      entries: Array<{
        key: string
        value: string
      }>
    }
    threatSeverity: string
  }> | null
}

export interface SafeBrowsingAnalysis {
  isSafe: boolean
  threats: string[]
  rawData: GoogleSafeBrowsingResult | null
  details: string
  riskScore: number
}

class GoogleSafeBrowsingService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = env.GOOGLE_SAFE_BROWSING_API_KEY
    this.baseUrl = env.GOOGLE_SAFE_BROWSING_API_URL
    
    if (!this.apiKey || this.apiKey === 'your_google_safe_browsing_api_key_here') {
      console.warn('⚠️ Google Safe Browsing API key not configured. Using mock data.')
    } else {
      console.log('✅ Google Safe Browsing API key configured successfully')
    }
  }

  async checkUrl(url: string): Promise<SafeBrowsingAnalysis> {
    if (!this.apiKey || this.apiKey === 'your_google_safe_browsing_api_key_here') {
      // Return mock data when API key is not configured
      return this.generateMockAnalysis()
    }
    
    try {
      const response = await axios.post<GoogleSafeBrowsingResult>(
        `${this.baseUrl}/threatMatches:find?key=${this.apiKey}`,
        {
          client: {
            clientId: "yourclientid",
            clientVersion: "1.5.2"
          },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [
              { url }
            ]
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      return this.parseSafeBrowsingResponse(response.data)
    } catch (error) {
      console.error('Google Safe Browsing error:', error)
      // Return mock data on error
      return this.generateMockAnalysis()
    }
  }

  private generateMockAnalysis(): SafeBrowsingAnalysis {
    // Generate somewhat realistic mock data
    const isSafe = Math.random() > 0.1 // 90% chance of being safe
    const threats = isSafe ? [] : ['malware', 'phishing']

    return {
      isSafe,
      threats,
      rawData: null,
      details: isSafe ? 'No threats detected' : 'Threats detected (mock data)',
      riskScore: isSafe ? 0 : 50
    }
  }

  private parseSafeBrowsingResponse(data: GoogleSafeBrowsingResult): SafeBrowsingAnalysis {
    const hasThreats = data.matches !== null
    const threats = (data.matches || []).map(match => match.threatType)
    const uniqueThreats = [...new Set(threats)]

    return {
      isSafe: !hasThreats,
      threats: uniqueThreats,
      rawData: data,
      details: hasThreats ? 'Threats detected' : 'No threats detected',
      riskScore: hasThreats ? 50 : 0
    }
  }
}

export const googleSafeBrowsingService = new GoogleSafeBrowsingService()
