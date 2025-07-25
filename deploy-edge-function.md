# Deploy Paystack Verification Edge Function to Hosted Supabase

## Option 1: Using Supabase CLI (Recommended)

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Link to your hosted project
```bash
# Login to Supabase
npx supabase login

# Link to your hosted project (replace with your project reference)
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Deploy the Edge Function
```bash
# Deploy the function
npx supabase functions deploy verify-paystack-payment

# Set environment variables
npx supabase secrets set PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
```

## Option 2: Manual Deployment via Dashboard

### 1. Go to Supabase Dashboard
- Navigate to your project at https://supabase.com/dashboard
- Go to **Edge Functions** section
- Click **Create Function**

### 2. Create Function
- **Function Name:** `verify-paystack-payment`
- **Copy and paste** the code from `supabase/functions/verify-paystack-payment/index.ts`

### 3. Set Environment Variables  
- Go to **Settings** → **Environment Variables**
- Add new variable:
  - **Name:** `PAYSTACK_SECRET_KEY`
  - **Value:** Your Paystack secret key (starts with `sk_test_` or `sk_live_`)

## Option 3: Quick Deploy Script

Save this as `deploy-paystack-function.js` and run with `node deploy-paystack-function.js`:

```javascript
const fs = require('fs');
const https = require('https');

// Configuration - UPDATE THESE VALUES
const SUPABASE_PROJECT_REF = 'your-project-ref'; // Get from your dashboard URL
const SUPABASE_ACCESS_TOKEN = 'your-access-token'; // Get from dashboard settings
const PAYSTACK_SECRET_KEY = 'sk_test_your_secret_key_here';

// Read the Edge Function code
const functionCode = fs.readFileSync('./supabase/functions/verify-paystack-payment/index.ts', 'utf8');

// Deploy function
const deployFunction = () => {
  const data = JSON.stringify({
    name: 'verify-paystack-payment',
    source: functionCode,
    verify_jwt: false
  });

  const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${SUPABASE_PROJECT_REF}/functions`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Function deployment status: ${res.statusCode}`);
    res.on('data', (d) => {
      console.log('Response:', d.toString());
    });
  });

  req.on('error', (e) => {
    console.error('Error deploying function:', e);
  });

  req.write(data);
  req.end();
};

// Set environment variable
const setEnvVar = () => {
  const data = JSON.stringify({
    name: 'PAYSTACK_SECRET_KEY',
    value: PAYSTACK_SECRET_KEY
  });

  const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${SUPABASE_PROJECT_REF}/secrets`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Environment variable set status: ${res.statusCode}`);
    res.on('data', (d) => {
      console.log('Response:', d.toString());
    });
  });

  req.on('error', (e) => {
    console.error('Error setting environment variable:', e);
  });

  req.write(data);
  req.end();
};

// Run deployment
console.log('Deploying Edge Function...');
deployFunction();

setTimeout(() => {
  console.log('Setting environment variable...');
  setEnvVar();
}, 2000);
```

## Get Your Project Details

### Project Reference:
- Go to https://supabase.com/dashboard
- Your project URL will be: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- The `YOUR_PROJECT_REF` part is what you need

### Access Token:
- Go to https://supabase.com/dashboard/account/tokens
- Generate a new access token
- Copy and use it in the script

## Verify Deployment

After deployment, test the function:

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/verify-paystack-payment' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"reference":"T123456789"}'
```

Replace:
- `YOUR_PROJECT_REF` with your actual project reference
- `YOUR_ANON_KEY` with your anon key from dashboard settings

## Environment Variables Needed

Make sure these are set in your Supabase project:

1. **PAYSTACK_SECRET_KEY** - Your Paystack secret key
2. **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase URL (in your app)
3. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Your Supabase anon key (in your app)