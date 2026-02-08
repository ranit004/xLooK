// Test script to verify Gemini API connection
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    console.log("Testing Gemini API...");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);
    console.log("API Key (first 10 chars):", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");

    if (!process.env.GEMINI_API_KEY) {
        console.error("ERROR: GEMINI_API_KEY not found in environment!");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Try different model names
    const models = ["gemini-2.0-flash-001", "gemma-3-12b-it", "gemini-2.5-flash-preview-05-20"];

    for (const modelName of models) {
        try {
            console.log(`\nTrying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Hello' and nothing else.");
            const response = await result.response;
            console.log(`SUCCESS with ${modelName}:`, response.text());
            break; // Stop if one works
        } catch (error) {
            console.log(`FAILED with ${modelName}:`, error.message);
        }
    }
}

testGemini();
