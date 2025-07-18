const { MongoClient } = require('mongodb');

async function checkConnection(uri) {
    console.log('🔗 Testing MongoDB Atlas connection...');
    console.log(`📍 URI: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}`); // Hide credentials in log
    
    const client = new MongoClient(uri);

    try {
        console.log('⏳ Attempting to connect...');
        await client.connect();
        
        console.log('✅ Connected successfully to MongoDB Atlas!');
        
        // Test database operations
        const db = client.db('url-safety-checker');
        console.log(`📊 Database: ${db.databaseName}`);
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log(`📁 Collections found: ${collections.length}`);
        
        if (collections.length > 0) {
            collections.forEach(col => {
                console.log(`  - ${col.name}`);
            });
        }
        
        // Test a simple operation
        const testCollection = db.collection('connection-test');
        const testDoc = { 
            timestamp: new Date(), 
            message: 'Connection test successful',
            from: 'Node.js test script'
        };
        
        const insertResult = await testCollection.insertOne(testDoc);
        console.log(`✅ Test document inserted with ID: ${insertResult.insertedId}`);
        
        // Clean up test document
        await testCollection.deleteOne({ _id: insertResult.insertedId });
        console.log('🧹 Test document cleaned up');
        
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error(`Error: ${error.message}`);
        
        // Provide specific error messages
        if (error.message.includes('ENOTFOUND')) {
            console.error('🌐 Network error: Cannot resolve MongoDB hostname.');
            console.error('   - Check your internet connection');
            console.error('   - Verify the cluster URL is correct');
        } else if (error.message.includes('authentication failed')) {
            console.error('🔐 Authentication error: Invalid username or password.');
            console.error('   - Check your username and password');
            console.error('   - Ensure the user has proper permissions');
        } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
            console.error('🚫 IP Whitelist error: Your IP is not allowed.');
            console.error('   - Add your IP address to MongoDB Atlas network access list');
            console.error('   - Or allow access from anywhere (0.0.0.0/0) for testing');
        } else if (error.message.includes('timeout')) {
            console.error('⏱️ Connection timeout: Server took too long to respond.');
            console.error('   - Check your internet connection');
            console.error('   - Verify MongoDB Atlas cluster is running');
        }
        
        return false;
    } finally {
        await client.close();
        console.log('🔴 Connection closed');
    }
    
    return true;
}

// Test the provided URI
const uri = 'mongodb+srv://ranit1697:ZQPxwEmutSPkGYhf@friction.f2aovzz.mongodb.net/?retryWrites=true&w=majority&appName=friction';

checkConnection(uri).then(success => {
    if (success) {
        console.log('\n🎉 MongoDB connection test PASSED!');
        console.log('✅ You can now use this URI in your application');
    } else {
        console.log('\n❌ MongoDB connection test FAILED!');
        console.log('🔧 Please fix the issues above before proceeding');
    }
}).catch(err => {
    console.error('\n💥 Unexpected error:', err);
});
