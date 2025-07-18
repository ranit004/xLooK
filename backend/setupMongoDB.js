const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

console.log('🔧 MongoDB Atlas Connection Setup');
console.log('=====================================\n');

// Function to test MongoDB connection
async function testConnection(uri) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('url-safety-checker');
        
        // Test basic operations
        const testCollection = db.collection('connection-test');
        await testCollection.insertOne({ test: true, timestamp: new Date() });
        await testCollection.deleteOne({ test: true });
        
        return true;
    } catch (error) {
        console.error(`❌ Connection failed: ${error.message}`);
        return false;
    } finally {
        await client.close();
    }
}

// Function to update .env file
function updateEnvFile(mongoUri) {
    const envPath = path.join(__dirname, '.env');
    
    try {
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Replace or add MONGO_URI
        const mongoUriRegex = /^MONGO_URI=.*$/m;
        const newMongoUriLine = `MONGO_URI=${mongoUri}`;
        
        if (mongoUriRegex.test(envContent)) {
            envContent = envContent.replace(mongoUriRegex, newMongoUriLine);
        } else {
            // Add MONGO_URI if it doesn't exist
            if (envContent && !envContent.endsWith('\n')) {
                envContent += '\n';
            }
            envContent += `${newMongoUriLine}\n`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file updated successfully!');
        
    } catch (error) {
        console.error('❌ Failed to update .env file:', error.message);
    }
}

// Main setup function
async function setupMongoDB() {
    console.log('Please provide your MongoDB Atlas connection details:\n');
    
    // For demonstration, I'll provide some example URIs to test
    const commonURIs = [
        {
            name: 'Local MongoDB (Development)',
            uri: 'mongodb://localhost:27017/url-safety-checker'
        },
        {
            name: 'MongoDB Atlas (Example format)',
            uri: 'mongodb+srv://username:password@cluster.mongodb.net/url-safety-checker?retryWrites=true&w=majority'
        }
    ];
    
    console.log('📋 Common MongoDB URI formats:\n');
    commonURIs.forEach((example, index) => {
        console.log(`${index + 1}. ${example.name}`);
        console.log(`   ${example.uri}\n`);
    });
    
    console.log('🔧 To set up your MongoDB Atlas connection:');
    console.log('1. Follow the instructions in MONGODB_SETUP.md');
    console.log('2. Get your connection string from MongoDB Atlas');
    console.log('3. Update the MONGO_URI manually in .env file');
    console.log('4. Run: node checkMongoDBConnection.js to test\n');
    
    // Check if there's already a connection string in .env
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const mongoUriMatch = envContent.match(/^MONGO_URI=(.*)$/m);
        
        if (mongoUriMatch && mongoUriMatch[1]) {
            const currentUri = mongoUriMatch[1].trim();
            console.log('📍 Current MONGO_URI in .env:');
            
            // Hide credentials in log
            const maskedUri = currentUri.replace(/\/\/[^@]+@/, '//***:***@');
            console.log(`   ${maskedUri}\n`);
            
            if (!currentUri.includes('your_password_here') && !currentUri.includes('username:password')) {
                console.log('🧪 Testing current connection...');
                const isConnected = await testConnection(currentUri);
                
                if (isConnected) {
                    console.log('✅ Connection test PASSED!');
                    console.log('🎉 Your MongoDB is ready to use!');
                    return;
                } else {
                    console.log('❌ Connection test FAILED!');
                    console.log('🔧 Please check your credentials and network settings.');
                }
            }
        }
    }
    
    console.log('\n📝 Manual setup required:');
    console.log('1. Open .env file');
    console.log('2. Replace MONGO_URI with your actual connection string');
    console.log('3. Run: node checkMongoDBConnection.js');
}

// Run the setup
setupMongoDB().catch(console.error);
