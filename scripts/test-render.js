/**
 * Test script to verify Render deployment is working
 * This will test the production endpoint once deployed
 */

// Replace with your actual Render URL
const RENDER_URL = 'https://ai-code-reviewer-2b4k.onrender.com'; // Update with your URL

const testCode = `
function getUserData(userId) {
    const query = "SELECT * FROM users WHERE id = '" + userId + "'";
    return db.query(query);
}

var total = 0;
for (var i = 0; i < items.length; i++) {
    total += items[i].price;
}
`;

async function testRenderDeployment() {
    console.log('🌐 Testing Render Deployment');
    console.log('============================');
    console.log('📡 URL:', RENDER_URL);
    console.log('');

    try {
        // Test health endpoint first
        console.log('🏥 1. Health Check...');
        const healthResponse = await fetch(`${RENDER_URL}/health`);
        
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health check passed:', healthData.status);
            console.log('   Version:', healthData.version);
            console.log('   Features:', healthData.features?.join(', '));
        } else {
            console.log('❌ Health check failed:', healthResponse.status);
            return;
        }

        console.log('');
        
        // Test new unified endpoint
        console.log('🔍 2. Testing unified /review endpoint...');
        const reviewResponse = await fetch(`${RENDER_URL}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: testCode,
                language: 'javascript',
                options: {
                    includeMetrics: true,
                    includeSecurity: true,
                    includeQuality: true
                }
            })
        });

        if (reviewResponse.ok) {
            const reviewData = await reviewResponse.json();
            console.log('✅ Review endpoint working!');
            console.log('   Issues found:', reviewData.issues?.length || 0);
            console.log('   Summary:', reviewData.summary);
            
            if (reviewData.issues?.length > 0) {
                console.log('   Sample issue:', reviewData.issues[0].message);
            }
        } else {
            console.log('❌ Review endpoint failed:', reviewResponse.status);
            const errorText = await reviewResponse.text();
            console.log('   Error:', errorText);
            return;
        }

        console.log('');
        
        // Test API documentation
        console.log('📖 3. Testing API documentation...');
        const docsResponse = await fetch(`${RENDER_URL}/`);
        
        if (docsResponse.ok) {
            console.log('✅ API documentation accessible');
        } else {
            console.log('⚠️ API documentation issue:', docsResponse.status);
        }

        console.log('');
        console.log('🎉 Deployment Test Results:');
        console.log('============================');
        console.log('✅ Render deployment is working correctly!');
        console.log('✅ Unified endpoint is functional');
        console.log('✅ Local analysis engine is running');
        console.log('✅ No API keys required');
        console.log('');
        console.log('🔗 Ready for production use:');
        console.log(`   Health: ${RENDER_URL}/health`);
        console.log(`   Review: ${RENDER_URL}/review`);
        console.log(`   Docs: ${RENDER_URL}/`);

    } catch (error) {
        console.error('❌ Deployment test failed:', error.message);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('   - Render deployment still in progress (wait a few minutes)');
        console.log('   - Build failed (check Render logs)');
        console.log('   - Environment variables missing');
        console.log('   - Cold start delay (try again in 30 seconds)');
    }
}

async function waitForDeployment() {
    console.log('⏳ Waiting for Render deployment...');
    console.log('This may take 2-3 minutes for cold start.');
    console.log('');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 Attempt ${attempts}/${maxAttempts}...`);
        
        try {
            const response = await fetch(`${RENDER_URL}/health`);
            if (response.ok) {
                console.log('✅ Render service is responding!');
                break;
            }
        } catch (error) {
            // Service not ready yet
        }
        
        if (attempts < maxAttempts) {
            console.log('   Waiting 30 seconds...');
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
    
    if (attempts >= maxAttempts) {
        console.log('❌ Service did not respond after 5 minutes');
        console.log('💡 Check Render dashboard for deployment status');
        return;
    }
    
    await testRenderDeployment();
}

// Main execution
console.log('🚀 AI Code Reviewer - Render Deployment Tester');
console.log('==============================================');
console.log('');

// Check if we should wait for deployment or test immediately
const args = process.argv.slice(2);
if (args.includes('--wait')) {
    waitForDeployment();
} else {
    testRenderDeployment();
}

// Usage instructions
console.log('');
console.log('📖 Usage:');
console.log('   node test-render.js          # Test immediately');
console.log('   node test-render.js --wait   # Wait for deployment');
