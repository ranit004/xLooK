const http = require('http')

const testUrls = [
  'https://google.com',
  'https://github.com',
  'https://example.com'
]

const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
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
    
    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

const testUrlCheck = async (url) => {
  console.log(`\n🔍 Testing URL check for: ${url}`)
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/check-url',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  
  try {
    const result = await makeRequest(options, { url })
    console.log(`Status: ${result.status}`)
    
    if (result.data.success) {
      console.log(`✅ URL check successful`)
      console.log(`Risk: ${result.data.securityAnalysis.riskAnalysis.overallRisk}`)
      console.log(`Score: ${result.data.securityAnalysis.riskAnalysis.riskScore}/100`)
    } else {
      console.log(`❌ Error: ${result.data.error}`)
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`)
  }
}

const testScanStats = async () => {
  console.log(`\n📊 Testing scan statistics`)
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/scans/stats',
    method: 'GET'
  }
  
  try {
    const result = await makeRequest(options)
    console.log(`Status: ${result.status}`)
    
    if (result.data.success) {
      console.log(`✅ Statistics retrieved`)
      console.log(`Total scans: ${result.data.stats.total}`)
      console.log(`Today: ${result.data.stats.today}`)
      console.log(`Last week: ${result.data.stats.lastWeek}`)
      
      if (result.data.stats.riskDistribution.length > 0) {
        console.log(`Risk distribution:`)
        result.data.stats.riskDistribution.forEach(stat => {
          console.log(`  ${stat.riskLevel}: ${stat.count}`)
        })
      }
      
      if (result.data.stats.topUrls.length > 0) {
        console.log(`Top URLs:`)
        result.data.stats.topUrls.slice(0, 3).forEach(url => {
          console.log(`  ${url.url} (${url.scanCount} scans)`)
        })
      }
    } else {
      console.log(`❌ Error: ${result.data.error}`)
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`)
  }
}

const testRecentScans = async () => {
  console.log(`\n📋 Testing recent scans`)
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/scans/recent?limit=5',
    method: 'GET'
  }
  
  try {
    const result = await makeRequest(options)
    console.log(`Status: ${result.status}`)
    
    if (result.data.success) {
      console.log(`✅ Recent scans retrieved`)
      console.log(`Found ${result.data.scans.length} recent scans`)
      
      result.data.scans.forEach((scan, index) => {
        console.log(`  ${index + 1}. ${scan.url} - ${scan.result.securityAnalysis.riskAnalysis.overallRisk}`)
      })
      
      if (result.data.pagination) {
        console.log(`Pagination: Page ${result.data.pagination.currentPage} of ${result.data.pagination.totalPages}`)
      }
    } else {
      console.log(`❌ Error: ${result.data.error}`)
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`)
  }
}

const testUrlHistory = async (url) => {
  console.log(`\n🕒 Testing URL history for: ${url}`)
  
  const encodedUrl = encodeURIComponent(url)
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/scans/url/${encodedUrl}?limit=3`,
    method: 'GET'
  }
  
  try {
    const result = await makeRequest(options)
    console.log(`Status: ${result.status}`)
    
    if (result.data.success) {
      console.log(`✅ URL history retrieved`)
      console.log(`Found ${result.data.count} historical scans`)
      
      result.data.scans.forEach((scan, index) => {
        const date = new Date(scan.createdAt).toLocaleString()
        const risk = scan.result.securityAnalysis.riskAnalysis.overallRisk
        console.log(`  ${index + 1}. ${date} - ${risk}`)
      })
    } else {
      console.log(`❌ Error: ${result.data.error}`)
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`)
  }
}

const runTests = async () => {
  console.log('🧪 Testing MongoDB Integration and Scan Endpoints...')
  console.log('Make sure the server is running with: npm run dev\n')
  
  // Test URL checks (this will populate the database)
  for (const url of testUrls) {
    await testUrlCheck(url)
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Wait for database writes to complete
  console.log(`\n⏳ Waiting for database operations to complete...`)
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Test scan statistics
  await testScanStats()
  
  // Test recent scans
  await testRecentScans()
  
  // Test URL history for first URL
  if (testUrls.length > 0) {
    await testUrlHistory(testUrls[0])
  }
  
  console.log(`\n✅ MongoDB integration tests completed!`)
  console.log(`\n📝 To connect to your MongoDB Atlas:`)
  console.log(`   1. Update MONGO_URI in .env with your actual connection string`)
  console.log(`   2. Replace 'username' and 'password' with your credentials`)
  console.log(`   3. Replace 'cluster' with your actual cluster name`)
}

const main = async () => {
  try {
    await runTests()
  } catch (error) {
    console.error('❌ Test suite failed:', error.message)
    console.log('Make sure the server is running on port 5000')
  }
}

main()
