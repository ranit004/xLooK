import { Request, Response } from 'express'
import validator from 'validator'
import { validateUrl } from '../utils/urlValidator'
import { virusTotalService } from '../services/virusTotalService'
import { googleSafeBrowsingService } from '../services/googleSafeBrowsingService'
import { whoisService } from '../services/whoisService'
import { sslService } from '../services/sslService'
import { redirectService } from '../services/redirectService'
import { ipinfoService } from '../services/ipinfoService'
import { riskAnalyzer, CombinedSecurityAnalysis } from '../services/riskAnalyzer'
import { checkUrlRisk as checkUrlRiskHelper } from '../utils/urlRiskChecker'
import Scan from '../models/Scan'

export interface URLCheckResult {
  id: string
  title: string
  description: string
  status: 'safe' | 'warning' | 'danger'
  details?: string
  value?: string
  category?: 'security' | 'info' | 'technical'
}

export const checkUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body

    // Validate URL
    const validation = validateUrl(url)
    
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error
      })
      return
    }

    console.log(`🔍 Comprehensive URL check: ${url}`)

    // Run all security checks in parallel
    const [
      virusTotalResult,
      safeBrowsingResult,
      whoisResult,
      sslResult,
      redirectResult,
      geolocationResult
    ] = await Promise.all([
      virusTotalService.getUrlReport(url),
      googleSafeBrowsingService.checkUrl(url),
      whoisService.lookupDomain(url),
      url.startsWith('https') ? sslService.checkSSLValidity(url) : Promise.resolve({
        valid: false,
        expiresOn: null,
        issuedBy: null,
        issuedTo: null,
        daysUntilExpiration: null,
        riskScore: 20,
        details: 'No HTTPS connection'
      }),
      redirectService.analyzeRedirectChain(url),
      ipinfoService.getGeolocation(url)
    ])

    // Analyze combined results
    const securityAnalysis = await riskAnalyzer.analyzeCombinedSecurity(
      virusTotalResult,
      safeBrowsingResult,
      whoisResult,
      sslResult,
      redirectResult,
      geolocationResult
    )

    // Convert to frontend format
    const results = generateResultsFromAnalysis(securityAnalysis, url)
    
    const responseData = {
      success: true,
      url: validation.parsedUrl?.toString(),
      results,
      securityAnalysis, // Include raw analysis data
      checkedAt: new Date().toISOString()
    }

    // Save scan result to database
    try {
      const scanDocument = new Scan({
        url: validation.parsedUrl?.toString() || url,
        result: {
          ...responseData,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        }
      })
      
      await scanDocument.save()
      console.log(`💾 Scan result saved to database for: ${url}`)
    } catch (dbError) {
      console.error('❌ Error saving to database:', dbError)
      // Don't fail the request if database save fails
    }

    res.json(responseData)

  } catch (error) {
    console.error('Error checking URL:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

function generateResultsFromAnalysis(
  analysis: CombinedSecurityAnalysis,
  url: string
): URLCheckResult[] {
  const { riskAnalysis, virusTotal, safeBrowsing, whois, ssl, redirects, geolocation } = analysis
  
  // Map risk levels to frontend status
  const mapRiskToStatus = (risk: string): 'safe' | 'warning' | 'danger' => {
    switch (risk) {
      case 'safe': return 'safe'
      case 'warning': return 'warning'
      case 'unsafe': return 'danger'
      default: return 'warning'
    }
  }

  const results: URLCheckResult[] = [
    {
      id: 'overall',
      title: 'Overall Safety',
      description: riskAnalysis.summary,
      status: mapRiskToStatus(riskAnalysis.overallRisk),
      value: riskAnalysis.overallRisk.toUpperCase(),
      category: 'security',
      details: `Risk Score: ${riskAnalysis.riskScore}/100 • Confidence: ${riskAnalysis.confidence}%`
    },
    {
      id: 'virustotal',
      title: 'VirusTotal Scan',
      description: virusTotal.isClean 
        ? `Clean - ${virusTotal.detectionRatio} security vendors flagged this URL`
        : `${virusTotal.positives} threats detected`,
      status: virusTotal.isClean ? 'safe' : 'danger',
      value: virusTotal.detectionRatio,
      category: 'security',
      details: virusTotal.threats.length > 0 
        ? `Threats: ${virusTotal.threats.join(', ')} • ${virusTotal.permalink}`
        : `Scanned by ${virusTotal.total} engines • ${virusTotal.permalink}`
    },
    {
      id: 'safebrowsing',
      title: 'Google Safe Browsing',
      description: safeBrowsing.details,
      status: safeBrowsing.isSafe ? 'safe' : 'danger',
      value: safeBrowsing.isSafe ? 'Clean' : 'Threats Found',
      category: 'security',
      details: safeBrowsing.threats.length > 0 
        ? `Threat types: ${safeBrowsing.threats.join(', ')}`
        : 'No malware or phishing detected'
    },
    {
      id: 'whois',
      title: 'WHOIS Information',
      description: whois.details,
      status: whois.isAvailable ? 'danger' : whois.riskScore > 20 ? 'warning' : 'safe',
      value: whois.domainAge ? `${Math.floor(whois.domainAge / 365)} years old` : 'Unknown',
      category: 'info',
      details: whois.registrar ? `Registrar: ${whois.registrar} • ${whois.details}` : whois.details
    },
    {
      id: 'ssl',
      title: 'SSL Certificate',
      description: ssl.details,
      status: ssl.valid ? (ssl.daysUntilExpiration && ssl.daysUntilExpiration < 30 ? 'warning' : 'safe') : 'danger',
      value: ssl.valid ? 'Valid' : 'Invalid',
      category: 'security',
      details: ssl.issuedBy 
        ? `Issued by: ${ssl.issuedBy} • Expires: ${ssl.expiresOn}`
        : ssl.details
    },
    {
      id: 'redirects',
      title: 'Redirect Chain',
      description: redirects.details,
      status: redirects.hasSuspiciousRedirects ? 'warning' : 'safe',
      value: redirects.totalRedirects === 0 ? 'Direct' : `${redirects.totalRedirects} redirects`,
      category: 'technical',
      details: redirects.redirectChain.length > 1 
        ? `Chain: ${redirects.redirectChain.map(r => r.url).join(' → ')}`
        : redirects.details
    },
    {
      id: 'geolocation',
      title: 'Server Location',
      description: geolocation.details,
      status: 'safe',
      value: geolocation.location,
      category: 'info',
      details: geolocation.data?.org 
        ? `Organization: ${geolocation.data.org} • IP: ${geolocation.data.ip}`
        : geolocation.details
    }
  ]

  return results
}

// New endpoint that matches your requirements
export const checkUrlRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;

    // Validate URL using validator.js
    if (!url || typeof url !== 'string') {
      res.status(400).json({
        success: false,
        error: 'URL is required and must be a string'
      });
      return;
    }

    if (!validator.isURL(url, { require_protocol: true })) {
      res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
      return;
    }

    console.log(`🔍 URL risk check: ${url}`);

    // Call the helper function
    const result = await checkUrlRiskHelper(url);

    // Return the response in the requested format
    res.json({
      verdict: result.verdict,
      virusTotalData: result.virusTotalData,
      googleSafeBrowsingData: result.googleSafeBrowsingData
    });

  } catch (error) {
    console.error('Error in checkUrlRisk endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
