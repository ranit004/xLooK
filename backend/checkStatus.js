const fs = require('fs');
const path = require('path');

console.log('📊 URL Safety Checker - Setup Status');
console.log('=====================================\n');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('✅ .env file exists\n');
    
    // Check MongoDB URI
    const mongoUriMatch = envContent.match(/^MONGO_URI=(.*)$/m);
    if (mongoUriMatch && mongoUriMatch[1]) {
        const uri = mongoUriMatch[1].trim();
        const maskedUri = uri.replace(/\/\/[^@]+@/, '//***:***@');
        
        if (uri.includes('your_password_here') || uri.includes('username:password')) {
            console.log('⚠️  MongoDB: Not configured (placeholder values)');
            console.log(`   Current: ${maskedUri}`);
        } else {
            console.log('✅ MongoDB: Configured');
            console.log(`   URI: ${maskedUri}`);
        }
    } else {
        console.log('❌ MongoDB: No MONGO_URI found');
    }
    
    console.log('\n📋 API Keys Status:');
    
    // Check API keys
    const apiKeys = [
        { name: 'VirusTotal', key: 'VIRUSTOTAL_API_KEY' },
        { name: 'Google Safe Browsing', key: 'GOOGLE_SAFE_BROWSING_API_KEY' },
        { name: 'IPinfo', key: 'IPINFO_API_KEY' }
    ];
    
    apiKeys.forEach(api => {
        const keyMatch = envContent.match(new RegExp(`^${api.key}=(.*)$`, 'm'));
        if (keyMatch && keyMatch[1]) {
            const key = keyMatch[1].trim();
            if (key.includes('your_') || key.includes('_here')) {
                console.log(`⚠️  ${api.name}: Not configured`);
            } else {
                console.log(`✅ ${api.name}: Configured`);
            }
        } else {
            console.log(`❌ ${api.name}: Missing`);
        }
    });
    
} else {
    console.log('❌ .env file not found');
}

console.log('\n🔧 Next Steps:');
console.log('1. Update MONGO_URI in .env with your MongoDB Atlas credentials');
console.log('2. Run: node checkMongoDBConnection.js to test MongoDB');
console.log('3. Update API keys in .env for full functionality');
console.log('4. Run: npm run dev to start the server');

console.log('\n📚 Available Scripts:');
console.log('- node checkMongoDBConnection.js  - Test MongoDB connection');
console.log('- node setupMongoDB.js           - MongoDB setup guide');
console.log('- node checkStatus.js            - Check current status');
console.log('- npm run dev                    - Start development server');
