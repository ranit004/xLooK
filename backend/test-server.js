const http = require('http')

const testUrls = [
  'https://example.com',
  'https://google.com',
  'invalid-url',
  'ftp://example.com',
  ''
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
  console.log('🧪 Testing URL Safety Checker Backend...\n')
  
  for (const url of testUrls) {
    console.log(`Testing: "${url}"`)
    try {
      const result = await testEndpoint(url)
      console.log(`Status: ${result.status}`)
      console.log(`Response: ${JSON.stringify(result.data, null, 2)}`)
    } catch (error) {
      console.log(`Error: ${error.message}`)
    }
    console.log('-'.repeat(50))
  }
}

// Test health endpoint
const testHealth = async () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
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
    req.end()
  })
}

const main = async () => {
  try {
    console.log('Testing health endpoint...')
    const healthResult = await testHealth()
    console.log(`Health Status: ${healthResult.status}`)
    console.log(`Health Response: ${JSON.stringify(healthResult.data, null, 2)}\n`)
    
    await runTests()
  } catch (error) {
    console.error('Failed to run tests:', error.message)
    console.log('Make sure the server is running on port 5000')
  }
}

main()
