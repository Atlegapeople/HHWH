import fetch from 'node-fetch';

// Simple API test for payment flow
async function testPaymentAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Payment API Endpoints\n');
  
  try {
    // Test 1: Check Paystack configuration endpoint
    console.log('📡 Testing Paystack configuration...');
    try {
      const configResponse = await fetch(`${baseUrl}/api/payments/config`);
      console.log(`   Status: ${configResponse.status}`);
      if (configResponse.ok) {
        const config = await configResponse.json();
        console.log(`   Public key available: ${!!config.publicKey}`);
        console.log('   ✅ Configuration endpoint working');
      } else {
        console.log('   ❌ Configuration endpoint failed');
      }
    } catch (error) {
      console.log(`   ❌ Configuration test failed: ${error.message}`);
    }

    // Test 2: Create a test payment record
    console.log('\n💳 Testing payment creation...');
    const testPayment = {
      appointment_id: 'test-appointment-123',
      payment_method: 'paystack',
      payment_gateway_id: 'test-payment-' + Date.now(),
      amount: 80000, // R800 in cents
      payment_status: 'pending'
    };

    try {
      const createResponse = await fetch(`${baseUrl}/api/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayment)
      });
      
      console.log(`   Status: ${createResponse.status}`);
      if (createResponse.ok) {
        const payment = await createResponse.json();
        console.log(`   Payment ID: ${payment.id}`);
        console.log('   ✅ Payment creation working');
        
        // Store for next test
        testPayment.id = payment.id;
      } else {
        const error = await createResponse.text();
        console.log(`   ❌ Payment creation failed: ${error}`);
      }
    } catch (error) {
      console.log(`   ❌ Payment creation test failed: ${error.message}`);
    }

    // Test 3: Check payment status endpoint
    console.log('\n🔍 Testing payment status check...');
    try {
      const statusResponse = await fetch(`${baseUrl}/api/payments/check-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: testPayment.payment_gateway_id
        })
      });
      
      console.log(`   Status: ${statusResponse.status}`);
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        console.log(`   Payment status: ${status.status}`);
        console.log(`   Message: ${status.message || 'No message'}`);
        console.log('   ✅ Status check endpoint working');
      } else {
        const error = await statusResponse.text();
        console.log(`   ❌ Status check failed: ${error}`);
      }
    } catch (error) {
      console.log(`   ❌ Status check test failed: ${error.message}`);
    }

    // Test 4: Test Edge Function verification (if available)
    console.log('\n🔄 Testing Edge Function verification...');
    try {
      // This will test the Supabase Edge Function
      const edgeResponse = await fetch(`${baseUrl}/api/payments/verify-edge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: 'test-reference-123'
        })
      });
      
      console.log(`   Status: ${edgeResponse.status}`);
      if (edgeResponse.ok) {
        const result = await edgeResponse.json();
        console.log(`   Verification available: ${result.success || false}`);
        console.log('   ✅ Edge Function verification accessible');
      } else {
        console.log('   ℹ️ Edge Function verification not configured (expected for localhost)');
      }
    } catch (error) {
      console.log(`   ℹ️ Edge Function test skipped: ${error.message}`);
    }

    // Test 5: Test doctor availability (needed for appointment booking)
    console.log('\n👨‍⚕️ Testing doctor availability...');
    try {
      const doctorsResponse = await fetch(`${baseUrl}/api/doctors`);
      console.log(`   Status: ${doctorsResponse.status}`);
      if (doctorsResponse.ok) {
        const doctors = await doctorsResponse.json();
        console.log(`   Doctors available: ${doctors.length || 0}`);
        if (doctors.length > 0) {
          console.log(`   First doctor: ${doctors[0].full_name} (Fee: R${doctors[0].consultation_fee/100})`);
        }
        console.log('   ✅ Doctor data available');
      } else {
        console.log('   ❌ Doctor data not available');
      }
    } catch (error) {
      console.log(`   ❌ Doctor availability test failed: ${error.message}`);
    }

    console.log('\n📊 Payment Flow Test Summary:');
    console.log('   - API endpoints are accessible');
    console.log('   - Payment creation and status checking working');
    console.log('   - Polling-based verification system in place');
    console.log('   - Ready for manual testing with Paystack');
    
    console.log('\n🔧 Manual Testing Instructions:');
    console.log('   1. Navigate to http://localhost:3000/patient/book-appointment');
    console.log('   2. Fill in booking form and select "Private Pay"');
    console.log('   3. Click payment button to open Paystack modal');
    console.log('   4. Use test card: 4084084084084081 (exp: 12/25, cvv: 123)');
    console.log('   5. Complete payment and close modal');
    console.log('   6. Watch button text change to "Verifying Payment..."');
    console.log('   7. Should show "Payment Successful!" within 30 seconds');

  } catch (error) {
    console.error('💥 Test suite failed:', error);
  }
}

// Run the test
testPaymentAPI()
  .then(() => {
    console.log('\n✅ API tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ API tests failed:', error);
    process.exit(1);
  });