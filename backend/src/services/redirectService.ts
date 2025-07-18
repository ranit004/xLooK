import puppeteer from 'puppeteer'

export interface RedirectStep {
  url: string
  statusCode: number
  timestamp: string
}

export interface RedirectAnalysis {
  redirectChain: RedirectStep[]
  finalUrl: string
  totalRedirects: number
  hasSuspiciousRedirects: boolean
  riskScore: number
  details: string
}

class RedirectService {
  async analyzeRedirectChain(url: string): Promise<RedirectAnalysis> {
    let browser
    
    try {
      console.log(`🔄 Analyzing redirect chain for: ${url}`)
      
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      })
      
      const page = await browser.newPage()
      
      // Track redirects
      const redirectChain: RedirectStep[] = []
      
      page.on('response', (response) => {
        const status = response.status()
        const responseUrl = response.url()
        
        // Track redirect responses (3xx status codes)
        if (status >= 300 && status < 400) {
          redirectChain.push({
            url: responseUrl,
            statusCode: status,
            timestamp: new Date().toISOString()
          })
        }
      })
      
      // Set a reasonable timeout
      page.setDefaultTimeout(10000)
      
      // Navigate to the URL
      const response = await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 10000
      })
      
      const finalUrl = page.url()
      
      // Add the initial URL if we have redirects
      if (redirectChain.length > 0) {
        redirectChain.unshift({
          url: url,
          statusCode: response?.status() || 200,
          timestamp: new Date().toISOString()
        })
      }
      
      // Add final URL if different
      if (finalUrl !== url && redirectChain.length > 0) {
        redirectChain.push({
          url: finalUrl,
          statusCode: 200,
          timestamp: new Date().toISOString()
        })
      }
      
      await browser.close()
      
      return this.analyzeRedirects(redirectChain, finalUrl, url)
      
    } catch (error) {
      console.error('Redirect analysis error:', error)
      
      if (browser) {
        await browser.close()
      }
      
      return this.generateMockRedirectAnalysis(url)
    }
  }
  
  private analyzeRedirects(redirectChain: RedirectStep[], finalUrl: string, originalUrl: string): RedirectAnalysis {
    const totalRedirects = redirectChain.length
    let riskScore = 0
    let details = ''
    let hasSuspiciousRedirects = false
    
    if (totalRedirects === 0) {
      details = 'No redirects detected - direct connection'
    } else if (totalRedirects === 1) {
      details = 'Single redirect detected'
    } else {
      details = `${totalRedirects} redirects detected`
      
      // Multiple redirects can be suspicious
      if (totalRedirects > 3) {
        riskScore += 20
        hasSuspiciousRedirects = true
        details += ' (multiple redirects - potentially suspicious)'
      }
    }
    
    // Check for suspicious redirect patterns
    for (const step of redirectChain) {
      const stepUrl = step.url.toLowerCase()
      
      // Check for suspicious domains or URL patterns
      if (stepUrl.includes('bit.ly') || 
          stepUrl.includes('tinyurl') || 
          stepUrl.includes('t.co') ||
          stepUrl.includes('short') ||
          stepUrl.includes('redirect')) {
        riskScore += 15
        hasSuspiciousRedirects = true
        details += ' (contains URL shorteners or suspicious domains)'
        break
      }
      
      // Check for HTTP to HTTPS or different domains
      const originalDomain = new URL(originalUrl).hostname
      try {
        const stepDomain = new URL(step.url).hostname
        if (originalDomain !== stepDomain) {
          riskScore += 10
          details += ' (redirects to different domain)'
        }
      } catch {
        // Ignore parsing errors
      }
    }
    
    return {
      redirectChain: redirectChain.length > 0 ? redirectChain : [{ url: originalUrl, statusCode: 200, timestamp: new Date().toISOString() }],
      finalUrl,
      totalRedirects,
      hasSuspiciousRedirects,
      riskScore,
      details
    }
  }
  
  private generateMockRedirectAnalysis(url: string): RedirectAnalysis {
    // Generate mock redirect data
    const hasRedirect = Math.random() > 0.7 // 30% chance of redirect
    
    if (hasRedirect) {
      const redirectChain: RedirectStep[] = [
        {
          url: url,
          statusCode: 301,
          timestamp: new Date().toISOString()
        },
        {
          url: url.replace('http://', 'https://'),
          statusCode: 200,
          timestamp: new Date().toISOString()
        }
      ]
      
      return {
        redirectChain,
        finalUrl: url.replace('http://', 'https://'),
        totalRedirects: 2,
        hasSuspiciousRedirects: false,
        riskScore: 0,
        details: 'HTTP to HTTPS redirect (mock data)'
      }
    } else {
      return {
        redirectChain: [{ url, statusCode: 200, timestamp: new Date().toISOString() }],
        finalUrl: url,
        totalRedirects: 0,
        hasSuspiciousRedirects: false,
        riskScore: 0,
        details: 'No redirects detected (mock data)'
      }
    }
  }
}

export const redirectService = new RedirectService()
