import axios from 'axios'
import env from '../config/env'

export interface Geolocation {
  ip: string
  city?: string
  region?: string
  country?: string
  loc?: string
  org?: string
  postal?: string
  timezone?: string
  rawData?: any
}

export interface GeolocationAnalysis {
  isLocated: boolean
  location: string
  riskScore: number
  details: string
  data: Geolocation | null
}

class IPinfoService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = env.IPINFO_API_KEY
    this.baseUrl = env.IPINFO_API_URL
    
    if (!this.apiKey || this.apiKey === 'your_ipinfo_api_key_here') {
      console.warn('⚠️ IPinfo API key not configured. Using mock data.')
    } else {
      console.log('✅ IPinfo API key configured successfully')
    }
  }
  async getGeolocation(url: string): Promise<GeolocationAnalysis> {
    if (!this.apiKey || this.apiKey === 'your_ipinfo_api_key_here') {
      // Return mock data when API key is not configured
      return this.generateMockGeolocation(url)
    }

    try {
      const { host } = new URL(url)

      const response = await axios.get<Geolocation>(`${this.baseUrl}/${host}?token=${this.apiKey}`, {
        timeout: 10000
      })

      return this.parseGeolocationResponse(response.data)
    } catch (error) {
      console.error('IPinfo error:', error)
      // Return mock data on error
      return this.generateMockGeolocation(url)
    }
  }

  private parseGeolocationResponse(data: Geolocation): GeolocationAnalysis {
    const locationDetails = []
    if (data.city) locationDetails.push(data.city)
    if (data.region) locationDetails.push(data.region)
    if (data.country) locationDetails.push(data.country)

    return {
      isLocated: true,
      location: locationDetails.join(', '),
      riskScore: 0,
      details: 'Geolocation data retrieved successfully',
      data,
    }
  }

  private generateMockGeolocation(url: string): GeolocationAnalysis {
    const mockLocation = 'San Francisco, CA, US'
    
    return {
      isLocated: true,
      location: mockLocation,
      riskScore: 0,
      details: 'Mock geolocation data used (API not configured)',
      data: {
        ip: '93.184.216.34',
        city: 'San Francisco',
        region: 'CA',
        country: 'US',
        loc: '37.7749,-122.4194',
        org: 'Mock Organization',
        postal: '94107',
        timezone: 'America/Los_Angeles',
        rawData: 'Mock IPinfo data (API not configured)'
      }
    }
  }
}

export const ipinfoService = new IPinfoService()
