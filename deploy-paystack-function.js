const fs = require('fs');
const https = require('https');

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Deploying Paystack Verification Edge Function...');

// Read configuration from environment variables
const CONFIG = {
  SUPABASE_PROJECT_REF: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0],
  SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY
};

console.log('🔧 Configuration loaded:');
console.log('- Project Ref:', CONFIG.SUPABASE_PROJECT_REF);
console.log('- Access Token:', CONFIG.SUPABASE_ACCESS_TOKEN ? '✅ Found' : '❌ Missing');
console.log('- Paystack Secret:', CONFIG.PAYSTACK_SECRET_KEY ? '✅ Found' : '❌ Missing');

// Validate configuration
if (!CONFIG.SUPABASE_PROJECT_REF) {
  console.error('❌ Could not extract project reference from NEXT_PUBLIC_SUPABASE_URL');
  console.error('   Expected format: https://your-project-ref.supabase.co');
  console.error('   Current value:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  process.exit(1);
}

if (!CONFIG.SUPABASE_ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN not found in environment variables');
  console.error('');
  console.error('📋 To fix this:');
  console.error('1. Go to: https://supabase.com/dashboard/account/tokens');
  console.error('2. Click "Generate new token"');
  console.error('3. Add this line to your .env.local file:');
  console.error('   SUPABASE_ACCESS_TOKEN=your_token_here');
  console.error('4. Run this script again');
  console.error('');
  console.error('💡 Alternative: You can also set it temporarily:');
  console.error('   SUPABASE_ACCESS_TOKEN=your_token node deploy-paystack-function.js');
  process.exit(1);
}

if (!CONFIG.PAYSTACK_SECRET_KEY) {
  console.error('❌ PAYSTACK_SECRET_KEY not found in environment variables');
  console.error('   This should be your sk_test_ or sk_live_ key');
  process.exit(1);
}

// Read the Edge Function code
let functionCode;
try {
  functionCode = fs.readFileSync('./supabase/functions/verify-paystack-payment/index.ts', 'utf8');
  console.log('✅ Edge Function code loaded successfully');
} catch (error) {
  console.error('❌ Could not read Edge Function file:', error.message);
  process.exit(1);
}

// Deploy function
const deployFunction = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: 'verify-paystack-payment',
      source: functionCode,
      verify_jwt: false
    });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${CONFIG.SUPABASE_PROJECT_REF}/functions`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    console.log('📤 Deploying to:', `https://api.supabase.com/v1/projects/${CONFIG.SUPABASE_PROJECT_REF}/functions`);

    const req = https.request(options, (res) => {
      let response = '';
      
      res.on('data', (chunk) => {
        response += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Edge Function deployed successfully');
          try {
            const parsedResponse = JSON.parse(response);
            console.log('📊 Function ID:', parsedResponse.id);
          } catch (e) {
            console.log('📊 Raw response:', response);
          }
          resolve();
        } else {
          console.error('❌ Function deployment failed:', res.statusCode);
          console.error('📊 Response:', response);
          reject(new Error(`Deployment failed with status ${res.statusCode}: ${response}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Error deploying function:', e);
      reject(e);
    });

    req.write(data);
    req.end();
  });
};

// Set environment variable
const setEnvVar = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: 'PAYSTACK_SECRET_KEY',
      value: CONFIG.PAYSTACK_SECRET_KEY
    });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${CONFIG.SUPABASE_PROJECT_REF}/secrets`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    console.log('⚙️ Setting environment variable...');

    const req = https.request(options, (res) => {
      let response = '';
      
      res.on('data', (chunk) => {
        response += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Environment variable set successfully');
          resolve();
        } else {
          console.error('❌ Environment variable setting failed:', res.statusCode);
          console.error('📊 Response:', response);
          reject(new Error(`Environment variable setting failed with status ${res.statusCode}: ${response}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Error setting environment variable:', e);
      reject(e);
    });

    req.write(data);
    req.end();
  });
};

// Run deployment sequence
async function deploy() {
  try {
    console.log('📤 Step 1: Deploying Edge Function...');
    await deployFunction();
    
    console.log('⚙️ Step 2: Setting environment variable...');
    await setEnvVar();
    
    console.log('🎉 Deployment completed successfully!');
    console.log('');
    console.log('🔗 Your Edge Function URL:');
    console.log(`https://${CONFIG.SUPABASE_PROJECT_REF}.supabase.co/functions/v1/verify-paystack-payment`);
    console.log('');
    console.log('🧪 Test your function with:');
    console.log(`curl -X POST 'https://${CONFIG.SUPABASE_PROJECT_REF}.supabase.co/functions/v1/verify-paystack-payment' \\`);
    console.log(`  -H 'Authorization: Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}' \\`);
    console.log(`  -H 'Content-Type: application/json' \\`);
    console.log(`  -d '{"reference":"T123456789"}'`);
    console.log('');
    console.log('✅ You can now test payments - the verification should work properly!');
    
  } catch (error) {
    console.error('💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();