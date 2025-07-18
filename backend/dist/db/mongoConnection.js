"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("../config/env"));
const mongoUri = env_1.default.MONGO_URI;
const validateMongoUri = (uri) => {
    const mongoUriRegex = /^mongodb(?:\+srv)?:\/\/.+/;
    return mongoUriRegex.test(uri);
};
const connectToMongoDB = async () => {
    try {
        if (!validateMongoUri(mongoUri)) {
            throw new Error('Invalid MongoDB URI format');
        }
        console.log('🔗 Connecting to MongoDB...');
        await mongoose_1.default.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
        });
        console.log('🍃 Successfully connected to MongoDB Atlas');
        console.log(`📊 Database: ${mongoose_1.default.connection.db?.databaseName || 'Unknown'}`);
        mongoose_1.default.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error.message);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected successfully');
        });
        mongoose_1.default.connection.on('close', () => {
            console.log('🔴 MongoDB connection closed');
        });
    }
    catch (error) {
        console.error('❌ Failed to connect to MongoDB:');
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            if (error.message.includes('ENOTFOUND')) {
                console.error('Network error: Cannot resolve MongoDB hostname. Check your internet connection and cluster URL.');
            }
            else if (error.message.includes('authentication failed')) {
                console.error('Authentication error: Check your username and password in the MongoDB URI.');
            }
            else if (error.message.includes('IP whitelist')) {
                console.error('IP Whitelist error: Add your IP address to MongoDB Atlas network access list.');
            }
        }
    }
};
process.on('SIGINT', async () => {
    console.log('🛾 Received SIGINT. Closing MongoDB connection...');
    await mongoose_1.default.connection.close();
    console.log('🔴 MongoDB connection closed.');
    process.exit(0);
});
exports.default = connectToMongoDB;
//# sourceMappingURL=mongoConnection.js.map