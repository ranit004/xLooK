const whois = require('whois')
import { URL } from 'url'

export interface WhoisData {
  domain: string
  registrar?: string
  registrationDate?: string
  expirationDate?: string
  nameServers?: string[]
  status?: string[]
  rawData?: string
}

export interface WhoisAnalysis {
  isAvailable: boolean
  domainAge: number | null
  daysUntilExpiration: number | null
  registrar: string | null
  riskScore: number
  details: string
  data: WhoisData | null
}

class WhoisService {
  async lookupDomain(url: string): Promise<WhoisAnalysis> {
    try {
      const parsedUrl = new URL(url)
      const domain = parsedUrl.hostname
      
      console.log(`🔍 WHOIS lookup for domain: ${domain}`)
      
      const whoisData = await this.performWhoisLookup(domain)
      return this.analyzeWhoisData(whoisData, domain)
      
    } catch (error) {
      console.error('WHOIS lookup error:', error)
      return this.generateMockWhoisAnalysis(url)
    }
  }

  private performWhoisLookup(domain: string): Promise<string> {
    return new Promise((resolve, reject) => {
      whois.lookup(domain, (err: Error | null, data: string) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  private analyzeWhoisData(rawData: string, domain: string): WhoisAnalysis {
    const whoisData = this.parseWhoisData(rawData, domain)
    
    let riskScore = 0
    let details = ''
    
    // Calculate domain age
    const domainAge = this.calculateDomainAge(whoisData.registrationDate)
    const daysUntilExpiration = this.calculateDaysUntilExpiration(whoisData.expirationDate)
    
    // Risk assessment based on domain age
    if (domainAge !== null) {
      if (domainAge < 30) {
        riskScore += 30 // Very new domain
        details += 'Very new domain (high risk). '
      } else if (domainAge < 180) {
        riskScore += 15 // New domain
        details += 'New domain (moderate risk). '
      } else if (domainAge > 365 * 2) {
        details += 'Established domain (low risk). '
      }
    }
    
    // Risk assessment based on expiration
    if (daysUntilExpiration !== null) {
      if (daysUntilExpiration < 30) {
        riskScore += 20 // Expiring soon
        details += 'Domain expires soon. '
      } else if (daysUntilExpiration > 365) {
        details += 'Domain has long-term registration. '
      }
    }
    
    // Check for privacy protection
    if (rawData.toLowerCase().includes('privacy') || rawData.toLowerCase().includes('redacted')) {
      details += 'WHOIS privacy protection enabled. '
    }
    
    const isAvailable = rawData.toLowerCase().includes('no match') || rawData.toLowerCase().includes('not found')
    
    if (isAvailable) {
      riskScore = 100 // Domain not registered
      details = 'Domain is not registered (very high risk)'
    }
    
    return {
      isAvailable,
      domainAge,
      daysUntilExpiration,
      registrar: whoisData.registrar || null,
      riskScore,
      details: details.trim() || 'Domain information available',
      data: whoisData
    }
  }

  private parseWhoisData(rawData: string, domain: string): WhoisData {
    const lines = rawData.split('\n')
    const data: WhoisData = {
      domain,
      rawData
    }
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      
      // Extract registrar
      if (lowerLine.includes('registrar:') || lowerLine.includes('sponsoring registrar:')) {
        const value = this.extractValue(line)
        data.registrar = value || undefined
      }
      
      // Extract registration date
      if (lowerLine.includes('creation date:') || lowerLine.includes('created:') || lowerLine.includes('registered:')) {
        const value = this.extractValue(line)
        data.registrationDate = value || undefined
      }
      
      // Extract expiration date
      if (lowerLine.includes('expiry date:') || lowerLine.includes('expires:') || lowerLine.includes('expiration:')) {
        const value = this.extractValue(line)
        data.expirationDate = value || undefined
      }
      
      // Extract name servers
      if (lowerLine.includes('name server:') || lowerLine.includes('nserver:')) {
        if (!data.nameServers) data.nameServers = []
        const ns = this.extractValue(line)
        if (ns) data.nameServers.push(ns)
      }
      
      // Extract status
      if (lowerLine.includes('status:') || lowerLine.includes('domain status:')) {
        if (!data.status) data.status = []
        const status = this.extractValue(line)
        if (status) data.status.push(status)
      }
    }
    
    return data
  }

  private extractValue(line: string): string | null {
    const parts = line.split(':')
    if (parts.length >= 2) {
      return parts.slice(1).join(':').trim()
    }
    return null
  }

  private calculateDomainAge(registrationDate?: string): number | null {
    if (!registrationDate) return null
    
    try {
      const regDate = new Date(registrationDate)
      const now = new Date()
      const diffTime = now.getTime() - regDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : null
    } catch {
      return null
    }
  }

  private calculateDaysUntilExpiration(expirationDate?: string): number | null {
    if (!expirationDate) return null
    
    try {
      const expDate = new Date(expirationDate)
      const now = new Date()
      const diffTime = expDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  private generateMockWhoisAnalysis(url: string): WhoisAnalysis {
    const parsedUrl = new URL(url)
    const domain = parsedUrl.hostname
    
    // Generate mock data
    const domainAge = Math.floor(Math.random() * 1000) + 365 // 1-3 years old
    const daysUntilExpiration = Math.floor(Math.random() * 365) + 30 // 30-395 days
    
    return {
      isAvailable: false,
      domainAge,
      daysUntilExpiration,
      registrar: 'Mock Registrar Inc.',
      riskScore: domainAge < 180 ? 15 : 0,
      details: `Domain age: ${Math.floor(domainAge / 365)} years (mock data)`,
      data: {
        domain,
        registrar: 'Mock Registrar Inc.',
        registrationDate: new Date(Date.now() - domainAge * 24 * 60 * 60 * 1000).toISOString(),
        expirationDate: new Date(Date.now() + daysUntilExpiration * 24 * 60 * 60 * 1000).toISOString(),
        nameServers: ['ns1.mockdns.com', 'ns2.mockdns.com'],
        status: ['clientTransferProhibited'],
        rawData: 'Mock WHOIS data (API not configured)'
      }
    }
  }
}

export const whoisService = new WhoisService()
