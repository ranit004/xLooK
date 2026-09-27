const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testSQLite() {
  console.log('🧪 Testing SQLite database operations with Prisma...');
  
  try {
    // 1. Create a test user
    const testEmail = `test_${Date.now()}@example.com`;
    const hashedPassword = await bcrypt.hash('TestPass123!', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: testEmail,
        hashedPassword
      }
    });
    
    console.log(`✅ Test User created successfully! ID: ${user.id}, Email: ${user.email}`);
    
    // 2. Add URL check history
    const history = await prisma.urlCheckHistory.create({
      data: {
        userId: user.id,
        url: 'https://example.com',
        verdict: 'safe',
        scanResults: JSON.stringify({ overallRisk: 'safe', score: 0 })
      }
    });
    
    console.log(`✅ URL Check History entry saved! ID: ${history.id}`);
    
    // 3. Query history
    const userHistory = await prisma.urlCheckHistory.findMany({
      where: { userId: user.id }
    });
    
    console.log(`✅ Retrieved ${userHistory.length} history item(s) from SQLite database.`);
    
    // 4. Clean up test user
    await prisma.user.delete({ where: { id: user.id } });
    console.log('🧹 Cleaned up test user');
    
    console.log('\n🎉 SQLite database read/write test PASSED cleanly!');
  } catch (error) {
    console.error('❌ SQLite test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSQLite();
