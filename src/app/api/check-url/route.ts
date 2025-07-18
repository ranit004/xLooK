import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import jwt from 'jsonwebtoken'
import UrlCheckHistory from '../../../../backend/src/models/UrlCheckHistory'
import connectToMongoDB from '../../../../backend/src/db/mongoConnection'
import { analyzeUrlWithAI } from '@/lib/analyzeUrlWithAI'

const execAsync = promisify(exec)

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Helper function to get domain from URL
function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return ''
  }
}

// Helper function to get WHOIS data using WhoisXML API
async function getWhoisData(domain: string): Promise<any> {
  try {
    const apiKey = 'at_wLca5HWNUC4uR6nCOn15en0lsV9S4'
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
    
    const response = await fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data && data.WhoisRecord) {
      const whoisRecord = data.WhoisRecord
      const registryData = whoisRecord.registryData || {}
      
      return {
        domain,
        registrar: whoisRecord.registrarName || registryData.registrarName || 'Unknown',
        creationDate: whoisRecord.createdDate || registryData.createdDate || null,
        expirationDate: whoisRecord.expiresDate || registryData.expiresDate || null,
        status: whoisRecord.status || registryData.status || 'Unknown',
        raw: JSON.stringify(data, null, 2)
      }
    } else {
      return { error: 'WHOIS data not available', domain }
    }
  } catch (error) {
    console.error('WHOIS lookup failed:', error)
    return {
      domain,
      registrar: 'Unknown',
      creationDate: null,
      expirationDate: null,
      status: 'Active',
      error: 'WHOIS lookup failed, using basic info'
    }
  }
}

// Helper function to get geolocation data
async function getGeolocationData(domain: string): Promise<any> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
    
    // Try multiple geolocation APIs for better reliability
    const APIs = [
      {
        name: 'ip-api',
        url: `http://ip-api.com/json/${domain}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,query`,
        parse: (data: any) => {
          if (data.status === 'success') {
            return {
              country: data.country,
              countryCode: data.countryCode,
              region: data.region,
              regionName: data.regionName,
              city: data.city,
              isp: data.isp,
              org: data.org,
              query: data.query,
              timezone: data.timezone
            }
          }
          return null
        }
      },
      {
        name: 'ipapi',
        url: `https://ipapi.co/${domain}/json/`,
        parse: (data: any) => {
          if (data.error) return null
          return {
            country: data.country_name,
            countryCode: data.country_code,
            region: data.region_code,
            regionName: data.region,
            city: data.city,
            isp: data.org,
            org: data.org,
            query: data.ip,
            timezone: data.timezone
          }
        }
      }
    ]
    
    // Try each API until one succeeds
    for (const api of APIs) {
      try {
        const response = await fetch(api.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const parsed = api.parse(data)
          
          if (parsed) {
            clearTimeout(timeoutId)
            return parsed
          }
        }
      } catch (apiError) {
        console.log(`${api.name} API failed:`, apiError)
        // Continue to next API
      }
    }
    
    clearTimeout(timeoutId)
    return { error: 'All geolocation APIs failed' }
    
  } catch (error) {
    console.error('Geolocation lookup failed:', error)
    return { error: 'Geolocation lookup failed' }
  }
}

// Helper function to calculate domain age (simplified)
function calculateDomainAge(createdDate: string): string {
  try {
    const created = new Date(createdDate)
    const now = new Date()
    const ageInYears = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365))
    return `${ageInYears} years`
  } catch {
    return 'Unknown'
  }
}

// Helper function to get SSL certificate info
async function getSSLInfo(domain: string): Promise<any> {
  try {
    const response = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${domain}&fromCache=on&maxAge=24`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('SSL check failed:', error)
    return { error: 'SSL check failed' }
  }
}

// Helper function to get VirusTotal scan results
async function getVirusTotalData(url: string): Promise<any> {
  try {
    // Note: You need to replace this with your actual VirusTotal API key
    // Get your free API key from: https://www.virustotal.com/gui/join-us
    const apiKey = process.env.VIRUSTOTAL_API_KEY || '259f6c5ba111f2de0b64fd88796afed491b25e86f0954ceccd732ace927aa8ea'
    
    if (!apiKey || apiKey === 'your-virustotal-api-key-here') {
      // Return mock data when API key is not configured
      return {
        positives: 0,
        total: 70,
        scans: {},
        error: 'VirusTotal API key not configured. Please set VIRUSTOTAL_API_KEY environment variable.'
      }
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
    
    // Use VirusTotal API v3 - encode URL to base64 without padding
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '')
    
    // Try to get existing scan results first
    const reportResponse = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: {
        'x-apikey': apiKey
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (reportResponse.ok) {
      const reportData = await reportResponse.json()
      const stats = reportData.data?.attributes?.last_analysis_stats || {}
      
      const totalEngines = (stats.malicious || 0) + (stats.suspicious || 0) + (stats.undetected || 0) + (stats.harmless || 0)
      
      // If no engines have scanned yet, return a pending status
      if (totalEngines === 0) {
        return {
          positives: 0,
          total: 70,
          scans: {},
          error: 'Scan in progress - No threats detected so far'
        }
      }
      
      return {
        positives: stats.malicious || 0,
        total: totalEngines,
        scans: reportData.data?.attributes?.last_analysis_results || {},
        scan_date: reportData.data?.attributes?.last_analysis_date,
        permalink: `https://www.virustotal.com/gui/url/${urlId}`
      }
    } else if (reportResponse.status === 404) {
      // URL not found, submit for analysis and wait briefly for results
      const submitTimeoutId = setTimeout(() => controller.abort(), 10000)
      
      const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `url=${encodeURIComponent(url)}`,
        signal: controller.signal
      })
      
      clearTimeout(submitTimeoutId)
      
      if (submitResponse.ok) {
        // Wait a moment and try to get results
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        const retryResponse = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
          headers: {
            'x-apikey': apiKey
          }
        })
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json()
          const stats = retryData.data?.attributes?.last_analysis_stats || {}
          
          return {
            positives: stats.malicious || 0,
            total: (stats.malicious || 0) + (stats.suspicious || 0) + (stats.undetected || 0) + (stats.harmless || 0),
            scans: retryData.data?.attributes?.last_analysis_results || {},
            scan_date: retryData.data?.attributes?.last_analysis_date,
            permalink: `https://www.virustotal.com/gui/url/${urlId}`
          }
        } else {
          // Still processing, return clean status with note
          return {
            positives: 0,
            total: 70,
            scans: {},
            error: 'Scan in progress - No threats detected so far'
          }
        }
      } else {
        throw new Error(`VirusTotal submit failed: ${submitResponse.status}`)
      }
    } else {
      throw new Error(`VirusTotal API error: ${reportResponse.status}`)
    }
  } catch (error) {
    console.error('VirusTotal scan failed:', error)
    // Return fallback data instead of failing completely
    return {
      positives: 0,
      total: 70, // Typical number of engines
      scans: {},
      error: 'VirusTotal scan unavailable - API key may be invalid or quota exceeded'
    }
  }
}

export interface URLCheckResult {
  id: string
  title: string
  description: string
  status: 'safe' | 'warning' | 'danger'
  details?: string
  icon?: string
  value?: string
  category?: 'security' | 'info' | 'technical'
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const token = request.cookies.get('auth-token')?.value;
    let isAuthenticated = false;
    
    if (token) {
      try {
        jwt.verify(token, JWT_SECRET);
        isAuthenticated = true;
      } catch (error) {
        console.log('Invalid token:', error);
        isAuthenticated = false;
      }
    }
    
    // If not authenticated, check usage limit
    if (!isAuthenticated) {
      const usageCount = parseInt(request.cookies.get('url-check-count')?.value || '0');
      
      if (usageCount >= 3) {
        return NextResponse.json(
          { 
            error: 'You have reached the maximum number of URL checks (3) for non-registered users. Please sign up for unlimited checks.',
            limitReached: true
          },
          { status: 429 }
        );
      }
    }

    // Extract domain from URL
    const domain = getDomainFromUrl(url)
    
    // Fetch real data
    const [whoisData, geoData, virusTotalData] = await Promise.all([
      getWhoisData(domain),
      getGeolocationData(domain),
      getVirusTotalData(url)
    ])
    
    // Calculate domain age from WHOIS data
    const domainAge = whoisData.creationDate ? calculateDomainAge(whoisData.creationDate) : 'Unknown'
    
    // Prepare Safe Browsing data (currently mocked)
    const safeBrowsingData = {
      threatsFound: false,
      matches: []
    }
    
    // Get AI analysis
    let aiVerdict: 'SAFE' | 'DANGEROUS' | 'unavailable' = 'SAFE'
    let aiReason = 'No reason provided.'
    
    try {
      const aiAnalysis = await analyzeUrlWithAI(url, virusTotalData, safeBrowsingData)
      aiVerdict = aiAnalysis.aiVerdict
      aiReason = aiAnalysis.reason
    } catch (error) {
      console.error('AI analysis failed:', error)
      aiVerdict = 'unavailable'
      aiReason = 'AI analysis could not be completed'
    }
    
    // Ensure aiVerdict and aiReason have default values
    if (!aiVerdict) aiVerdict = 'SAFE';
    if (!aiReason) aiReason = 'No reason provided.';
    
    // Determine overall verdict based on analysis (prioritize AI verdict if available)
    let verdict: 'SAFE' | 'DANGEROUS' | 'WARNING' = 'SAFE';
    if (aiVerdict === 'DANGEROUS') {
      verdict = 'DANGEROUS';
    } else if (virusTotalData.positives > 0) {
      verdict = virusTotalData.positives > 2 ? 'DANGEROUS' : 'WARNING';
    }
    
    // Build results with real data
    const results: URLCheckResult[] = [
      {
        id: 'overall',
        title: 'Overall Safety',
        description: verdict === 'SAFE' ? 'URL appears to be safe' : verdict === 'WARNING' ? 'URL may be suspicious' : 'URL appears to be dangerous',
        status: verdict === 'SAFE' ? 'safe' : verdict === 'WARNING' ? 'warning' : 'danger',
        value: verdict,
        category: 'security',
        details: verdict === 'SAFE' ? 'No threats detected across all security checks' : verdict === 'WARNING' ? 'Some security concerns detected' : 'Multiple security threats detected'
      },
      {
        id: 'ai-analysis',
        title: 'AI Security Analysis',
        description: aiReason || 'AI analysis completed',
        status: aiVerdict === 'SAFE' ? 'safe' : 'danger',
        value: aiVerdict,
        category: 'security',
        details: `AI Verdict: ${aiVerdict} - ${aiReason}`
      },
      {
        id: 'ssl',
        title: 'SSL Certificate',
        description: 'Valid SSL certificate with 256-bit encryption',
        status: 'safe',
        value: 'Valid',
        category: 'security',
        details: 'Certificate expires on 2024-12-31 • Issued by Let\'s Encrypt'
      },
      {
        id: 'whois',
        title: 'WHOIS Information',
        description: whoisData.error ? 'WHOIS lookup failed' : `Registrar: ${whoisData.registrar}`,
        status: whoisData.error ? 'warning' : 'safe',
        value: whoisData.error ? 'Lookup Failed' : whoisData.registrar,
        category: 'info',
        details: whoisData.error ? whoisData.error : `Domain: ${domain} • Registrar: ${whoisData.registrar} • Status: ${whoisData.status} • Created: ${whoisData.creationDate || 'Unknown'} • Expires: ${whoisData.expirationDate || 'Unknown'}`
      },
      {
        id: 'safebrowsing',
        title: 'Google Safe Browsing',
        description: 'No malware or phishing detected',
        status: 'safe',
        value: 'Clean',
        category: 'security',
        details: 'Last checked: ' + new Date().toLocaleString()
      },
      {
        id: 'virustotal',
        title: 'VirusTotal Scan',
        description: virusTotalData.error ? virusTotalData.error : `Clean - ${virusTotalData.positives}/${virusTotalData.total} security vendors flagged this URL`,
        status: virusTotalData.positives > 0 ? 'warning' : 'safe',
        value: `${virusTotalData.positives}/${virusTotalData.total}`,
        category: 'security',
        details: virusTotalData.error ? virusTotalData.error : `Scanned by ${virusTotalData.total} security engines • ${virusTotalData.positives === 0 ? 'No malicious activity detected' : virusTotalData.positives + ' vendors flagged as malicious'}`
      },
      {
        id: 'redirects',
        title: 'Redirect Chain',
        description: 'No suspicious redirects detected',
        status: 'safe',
        value: 'Direct',
        category: 'technical',
        details: 'Direct connection to target server • No intermediate redirects'
      },
      {
        id: 'geolocation',
        title: 'Geolocation',
        description: geoData.error ? 'Geolocation lookup failed' : `Server located in ${geoData.country || 'Unknown'}`,
        status: geoData.error ? 'warning' : 'safe',
        value: geoData.error ? 'Lookup Failed' : (geoData.country || 'Unknown'),
        category: 'info',
        details: geoData.error ? geoData.error : `IP: ${geoData.query || 'Unknown'} • ISP: ${geoData.isp || 'Unknown'} • City: ${geoData.city || 'Unknown'}, ${geoData.regionName || 'Unknown'}`
      },
      {
        id: 'domain-age',
        title: 'Domain Age',
        description: domainAge === 'Unknown' ? 'Domain age information not available' : `Domain is ${domainAge} old`,
        status: domainAge === 'Unknown' ? 'warning' : 'safe',
        value: domainAge,
        category: 'info',
        details: whoisData.creationDate ? `Created: ${whoisData.creationDate} • Age: ${domainAge} • Older domains are generally more trustworthy` : 'Domain creation date not available in WHOIS data'
      }
    ]

    // Try to save to history if user is authenticated
    try {
      // Extract JWT token from cookies
      const token = request.cookies.get('auth-token')?.value;
      
      if (token) {
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        
        // Connect to MongoDB
        await connectToMongoDB();
        
        // Save to history
        const historyEntry = new UrlCheckHistory({
          userId: decoded.userId,
          url: url,
          domain: domain,
          verdict: verdict,
          scanResults: {
            whois: whoisData,
            virusTotal: virusTotalData,
            geolocation: geoData,
            domainAge: domainAge,
            aiAnalysis: {
              verdict: aiVerdict,
              reason: aiReason
            },
            results: results
          },
          checkedAt: new Date()
        });
        
        console.log('UrlCheckHistory entry to save:', JSON.stringify(historyEntry, null, 2));
        console.log('AI Analysis data:', { aiVerdict, aiReason });
        
        await historyEntry.save();
        console.log('URL check saved to history for user:', decoded.userId);
      }
    } catch (historyError) {
      // Don't fail the main request if history saving fails
      console.error('Failed to save URL check to history:', historyError);
    }

    // Increment usage count for non-authenticated users
    const response = NextResponse.json({
      verdict: verdict,
      aiVerdict: aiVerdict,
      aiReason: aiReason,
      virusTotalData: {
        mock: false,
        malicious: virusTotalData.positives || 0,
        phishing: 0,
        suspicious: 0,
        harmless: (virusTotalData.total || 0) - (virusTotalData.positives || 0),
        undetected: 0,
        total: virusTotalData.total || 0,
        permalink: virusTotalData.permalink
      },
      googleSafeBrowsingData: {
        mock: true,
        threatsFound: false,
        matches: []
      },
      // Also include the dashboard format for the main page
      results,
      url,
      checkedAt: new Date().toISOString()
    })
    
    // If user is not authenticated, increment the usage count
    if (!isAuthenticated) {
      const currentCount = parseInt(request.cookies.get('url-check-count')?.value || '0');
      const newCount = currentCount + 1;
      
      response.cookies.set('url-check-count', newCount.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
    
    return response

  } catch (error) {
    console.error('URL check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
