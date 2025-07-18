const http = require('http')

const testUrls = [
  'https://google.com',
  'https://example.com',
  'https://github.com',
  'http://insecure-site.com',
  'https://malware-test.com'
]

const testEndpoint = async (url) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ url })
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/check-url',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(body)
          resolve({ status: res.statusCode, data: result })
        } catch (e) {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

const runTests = async () => {
  console.log('🔒 Testing Enhanced URL Safety Checker with API Integration...\n')
  
  for (const url of testUrls) {
    console.log(`\n🔍 Testing: "${url}"`)
    console.log('='.repeat(60))
    
    try {
      const result = await testEndpoint(url)
      console.log(`Status: ${result.status}`)
      
      if (result.data.success) {
        const { riskAnalysis, virusTotal, safeBrowsing, results } = result.data.securityAnalysis || {}
        
        if (riskAnalysis) {
          console.log(`\n📊 Risk Analysis:`)
          console.log(`  Overall Risk: ${riskAnalysis.overallRisk.toUpperCase()}`)
          console.log(`  Risk Score: ${riskAnalysis.riskScore}/100`)
          console.log(`  Confidence: ${riskAnalysis.confidence}%`)
          console.log(`  Summary: ${riskAnalysis.summary}`)
        }
        
        if (virusTotal) {
          console.log(`\n🛡️ VirusTotal:`)
          console.log(`  Clean: ${virusTotal.isClean}`)
          console.log(`  Detection Ratio: ${virusTotal.detectionRatio}`)
          if (virusTotal.threats.length > 0) {
            console.log(`  Threats: ${virusTotal.threats.join(', ')}`)
          }
        }
        
        if (safeBrowsing) {
          console.log(`\n🔐 Google Safe Browsing:`)
          console.log(`  Safe: ${safeBrowsing.isSafe}`)
          console.log(`  Details: ${safeBrowsing.details}`)
          if (safeBrowsing.threats.length > 0) {
            console.log(`  Threats: ${safeBrowsing.threats.join(', ')}`)
          }
        }
        
        console.log(`\n📋 Frontend Results:`)
        result.data.results.forEach(item => {
          console.log(`  ${item.title}: ${item.status.toUpperCase()} (${item.value})`)
        })
        
      } else {
        console.log(`❌ Error: ${result.data.error}`)
      }
      
    } catch (error) {
      console.log(`❌ Request Error: ${error.message}`)
    }
    
    console.log('\\n' + '-'.repeat(60))
  }
}

const main = async () => {
  try {
    console.log('🚀 Starting API Integration Tests...')
    console.log('Make sure the server is running with: npm run dev\\n')
    
    await runTests()
    
    console.log('\\n✅ Tests completed!')
    console.log('\\nNote: If API keys are not configured, mock data will be used.')
  } catch (error) {
    console.error('❌ Failed to run tests:', error.message)
    console.log('Make sure the server is running on port 5000')
  }
}

main()
