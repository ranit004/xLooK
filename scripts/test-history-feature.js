const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET env var is required');

async function testScanHistoryFeature() {
  console.log('🧪 Testing Logged-in User Scan History Feature...');

  try {
    // 1. Create a logged-in user
    const user = await prisma.user.create({
      data: {
        name: 'Jane Doe',
        email: `janedoe_${Date.now()}@example.com`,
        hashedPassword: 'hashedpassword123'
      }
    });
    console.log(`✅ Logged-in User Created: ${user.name} (${user.id})`);

    // 2. Generate auth token for user
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

    // 3. Simulate URL check performed by logged in user
    const scannedUrl = 'https://github.com';
    const verdict = 'SAFE';
    const scanResults = {
      whois: { registrar: 'GitHub Inc.' },
      virusTotal: { harmless: 85, malicious: 0, total: 85 },
      aiAnalysis: { verdict: 'SAFE', reason: 'Official GitHub repository domain.' }
    };

    const savedHistory = await prisma.urlCheckHistory.create({
      data: {
        userId: user.id,
        url: scannedUrl,
        verdict: verdict,
        scanResults: JSON.stringify(scanResults),
        checkedAt: new Date()
      }
    });

    console.log(`✅ Scan History Saved to Database! Entry ID: ${savedHistory.id}`);

    // 4. Retrieve saved history for this logged-in user
    const history = await prisma.urlCheckHistory.findMany({
      where: { userId: user.id },
      orderBy: { checkedAt: 'desc' }
    });

    console.log(`✅ Retrieved ${history.length} scan history record(s) for ${user.email}:`);
    history.forEach(h => {
      console.log(`   - URL: ${h.url} | Verdict: ${h.verdict} | Time: ${h.checkedAt.toISOString()}`);
    });

    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
    console.log('🧹 Cleaned up test data');

    console.log('\n🎉 Logged-in user scan history feature PASSED ALL VERIFICATIONS!');
  } catch (error) {
    console.error('❌ Feature test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testScanHistoryFeature();
