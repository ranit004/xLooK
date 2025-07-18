import mongoose from 'mongoose';
import env from '../config/env';

const mongoUri = env.MONGO_URI;

// Validate MongoDB URI format
const validateMongoUri = (uri: string): boolean => {
    const mongoUriRegex = /^mongodb(?:\+srv)?:\/\/.+/;
    return mongoUriRegex.test(uri);
};

const connectToMongoDB = async (): Promise<void> => {
    try {
        // Validate MongoDB URI
        if (!validateMongoUri(mongoUri)) {
            throw new Error('Invalid MongoDB URI format');
        }
        
        console.log('🔗 Connecting to MongoDB...');
        
        // Connect with additional options
        await mongoose.connect(mongoUri, {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferCommands: false, // Disable mongoose buffering
        });
        
        console.log('🍃 Successfully connected to MongoDB Atlas');
        console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'Unknown'}`);
        
        // Handle connection events
        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error.message);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected successfully');
        });
        
        mongoose.connection.on('close', () => {
            console.log('🔴 MongoDB connection closed');
        });
        
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:');
        
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            
            // Provide specific error messages
            if (error.message.includes('ENOTFOUND')) {
                console.error('Network error: Cannot resolve MongoDB hostname. Check your internet connection and cluster URL.');
            } else if (error.message.includes('authentication failed')) {
                console.error('Authentication error: Check your username and password in the MongoDB URI.');
            } else if (error.message.includes('IP whitelist')) {
                console.error('IP Whitelist error: Add your IP address to MongoDB Atlas network access list.');
            }
        }
        
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛾 Received SIGINT. Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('🔴 MongoDB connection closed.');
    process.exit(0);
});

export default connectToMongoDB;
