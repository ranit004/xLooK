import { VirusTotalAnalysis } from './virusTotalService'
import { SafeBrowsingAnalysis } from './googleSafeBrowsingService'
import { WhoisAnalysis } from './whoisService'
import { SSLAnalysis } from './sslService'
import { RedirectAnalysis } from './redirectService'
import { GeolocationAnalysis } from './ipinfoService'

export interface RiskAnalysis {
  overallRisk: 'safe' | 'unsafe' | 'warning'
  riskScore: number
  reasons: string[]
  confidence: number
  summary: string
}

export interface CombinedSecurityAnalysis {
  riskAnalysis: RiskAnalysis
  virusTotal: VirusTotalAnalysis
  safeBrowsing: SafeBrowsingAnalysis
  whois: WhoisAnalysis
  ssl: SSLAnalysis
  redirects: RedirectAnalysis
  geolocation: GeolocationAnalysis
  checkedAt: string
}

class RiskAnalyzer {
  analyzeRisk(
    virusTotalData: VirusTotalAnalysis,
    safeBrowsingData: SafeBrowsingAnalysis
  ): RiskAnalysis {
    const reasons: string[] = []
    let totalRiskScore = 0
    let confidence = 100

    // Analyze VirusTotal results
    if (!virusTotalData.isClean) {
      const vtWeight = 0.6 // VirusTotal has 60% weight
      totalRiskScore += virusTotalData.riskScore * vtWeight
      
      reasons.push(`VirusTotal detected ${virusTotalData.positives}/${virusTotalData.total} threats`)
      
      if (virusTotalData.threats.length > 0) {
        reasons.push(`Threat types: ${virusTotalData.threats.join(', ')}`)
      }
    } else {
      reasons.push(`VirusTotal: Clean (${virusTotalData.detectionRatio})`)
    }

    // Analyze Google Safe Browsing results
    if (!safeBrowsingData.isSafe) {
      const gsbWeight = 0.4 // Google Safe Browsing has 40% weight
      totalRiskScore += safeBrowsingData.riskScore * gsbWeight
      
      reasons.push('Google Safe Browsing flagged this URL')
      
      if (safeBrowsingData.threats.length > 0) {
        reasons.push(`Safe Browsing threats: ${safeBrowsingData.threats.join(', ')}`)
      }
    } else {
      reasons.push('Google Safe Browsing: No threats detected')
    }

    // Determine overall risk level
    let overallRisk: 'safe' | 'unsafe' | 'warning'
    let summary: string

    if (totalRiskScore === 0) {
      overallRisk = 'safe'
      summary = 'URL appears to be safe based on security scans'
    } else if (totalRiskScore < 25) {
      overallRisk = 'warning'
      summary = 'URL has low risk indicators - exercise caution'
    } else if (totalRiskScore < 60) {
      overallRisk = 'warning'
      summary = 'URL has moderate risk indicators - be careful'
    } else {
      overallRisk = 'unsafe'
      summary = 'URL is flagged as potentially dangerous'
    }

    // Adjust confidence based on data availability
    if (virusTotalData.rawData === null && safeBrowsingData.rawData === null) {
      confidence = 50 // Lower confidence when using mock data
      reasons.push('Note: Using simulated data (API keys not configured)')
    }

    return {
      overallRisk,
      riskScore: Math.round(totalRiskScore),
      reasons,
      confidence,
      summary
    }
  }

  async analyzeCombinedSecurity(
    virusTotalData: VirusTotalAnalysis,
    safeBrowsingData: SafeBrowsingAnalysis,
    whoisData: WhoisAnalysis,
    sslData: SSLAnalysis,
    redirectsData: RedirectAnalysis,
    geolocationData: GeolocationAnalysis
  ): Promise<CombinedSecurityAnalysis> {
    const reasons: string[] = []
    let totalRiskScore = 0
  
    const appendReasons = (reason: string) => {
      if (!reasons.includes(reason)) {
        reasons.push(reason)
      }
    }

    const addRisk = (risk: number, reason: string) => {
      totalRiskScore += risk
      appendReasons(reason)
    }
  
    if (!virusTotalData.isClean) {
      addRisk(virusTotalData.riskScore * 0.4, `VirusTotal: Detected threats (${virusTotalData.positives}/${virusTotalData.total})`)
    } else {
      appendReasons(`VirusTotal: No threats detected`)
    }

    if (!safeBrowsingData.isSafe) {
      addRisk(safeBrowsingData.riskScore * 0.2, `Google Safe Browsing: Detected threats`)
    } else {
      appendReasons(`Google Safe Browsing: No threats detected`)
    }
  
    if (!whoisData.isAvailable) {
      addRisk(whoisData.riskScore * 0.1, `WHOIS: ${whoisData.details}`)
    } else {
      appendReasons(`WHOIS: ${whoisData.details}`)
    }
  
    if (!sslData.valid) {
      addRisk(sslData.riskScore * 0.1, `SSL: ${sslData.details}`)
    } else {
      appendReasons(`SSL: ${sslData.details}`)
    }

    if (redirectsData.totalRedirects > 0) {
      addRisk(redirectsData.riskScore * 0.1, `Redirects: ${redirectsData.details}`)
    } else {
      appendReasons(`Redirects: ${redirectsData.details}`)
    }

    if (geolocationData.isLocated) {
      appendReasons(`Geolocation: ${geolocationData.details}`)
    }

    const riskAnalysis: RiskAnalysis = {
      overallRisk: (totalRiskScore > 60 ? 'unsafe' : totalRiskScore > 30 ? 'warning' : 'safe') as 'safe' | 'unsafe' | 'warning',
      riskScore: Math.round(totalRiskScore),
      reasons,
      confidence: virusTotalData.rawData && safeBrowsingData.rawData ? 100 : 80,
      summary: totalRiskScore > 60 ? 'High risk detected' : totalRiskScore > 30 ? 'Moderate risk, proceed with caution' : 'Low risk, appears safe'
    }

    return {
      riskAnalysis,
      virusTotal: virusTotalData,
      safeBrowsing: safeBrowsingData,
      whois: whoisData,
      ssl: sslData,
      redirects: redirectsData,
      geolocation: geolocationData,
      checkedAt: new Date().toISOString()
    }
  }
}

export const riskAnalyzer = new RiskAnalyzer()
