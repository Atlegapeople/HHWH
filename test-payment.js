const puppeteer = require('puppeteer');

// Puppeteer test for payment flow
async function testPaymentFlow() {
  let browser;
  let page;

  try {
    console.log('🚀 Starting Puppeteer payment test...\n');

    // Launch browser
    browser = await puppeteer.launch({
      headless: true, // Use headless for WSL
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-extensions',
        '--no-first-run',
        '--disable-default-apps'
      ]
    });

    page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Enable console logging
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`❌ Browser Error: ${text}`);
      } else if (text.includes('🎉') || text.includes('✅') || text.includes('❌') || text.includes('🔍')) {
        console.log(`📋 Browser Log: ${text}`);
      }
    });

    // Listen for network requests
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/payments/') || url.includes('paystack')) {
        console.log(`📡 Network Request: ${request.method()} ${url}`);
      }
      request.continue();
    });

    // Navigate to booking page
    console.log('📄 Navigating to booking page...');
    await page.goto('http://localhost:3000/patient/book-appointment', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for page to load
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Booking page loaded');

    // Fill out the booking form
    console.log('📝 Filling out booking form...');

    // Select consultation type
    const consultationSelect = await page.$('select[name="consultation_type"]');
    if (consultationSelect) {
      await page.select('select[name="consultation_type"]', 'initial');
      console.log('✅ Selected consultation type');
    }

    // Select doctor (first available)
    const doctorSelect = await page.$('select[name="doctor_id"]');
    if (doctorSelect) {
      const doctorOptions = await page.$$eval('select[name="doctor_id"] option', options => 
        options.filter(option => option.value && option.value !== '').map(option => option.value)
      );
      if (doctorOptions.length > 0) {
        await page.select('select[name="doctor_id"]', doctorOptions[0]);
        console.log('✅ Selected doctor');
        
        // Wait for fee to load
        await page.waitForTimeout(2000);
      }
    }

    // Select date (tomorrow)
    const dateInput = await page.$('input[name="date"]');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await page.evaluate((date, selector) => {
        document.querySelector(selector).value = date;
      }, dateString, 'input[name="date"]');
      console.log('✅ Selected date');
      
      // Wait for time slots to load
      await page.waitForTimeout(2000);
    }

    // Select time slot (first available)
    const timeSelect = await page.$('select[name="time"]');
    if (timeSelect) {
      const timeOptions = await page.$$eval('select[name="time"] option', options => 
        options.filter(option => option.value && option.value !== '').map(option => option.value)
      );
      if (timeOptions.length > 0) {
        await page.select('select[name="time"]', timeOptions[0]);
        console.log('✅ Selected time slot');
      }
    }

    // Select payment method - Cash
    const cashRadio = await page.$('input[value="cash"]');
    if (cashRadio) {
      await page.click('input[value="cash"]');
      console.log('✅ Selected cash payment');
    }

    // Submit the form
    console.log('📤 Submitting booking form...');
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await page.click('button[type="submit"]');
      console.log('✅ Form submitted');
    }

    // Wait for payment UI to appear
    console.log('⏳ Waiting for payment UI...');
    try {
      await page.waitForSelector('button:has-text("Pay with Card"), button:has-text("Processing")', { 
        timeout: 10000 
      });
      console.log('✅ Payment UI appeared');
    } catch (error) {
      console.log('❌ Payment UI did not appear:', error.message);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'payment-ui-error.png' });
      console.log('📸 Screenshot saved: payment-ui-error.png');
      return;
    }

    // Check if Paystack script is loaded
    const paystackLoaded = await page.evaluate(() => {
      return typeof window.PaystackPop !== 'undefined';
    });
    console.log(`📋 Paystack script loaded: ${paystackLoaded}`);

    // Click the payment button
    console.log('💳 Clicking payment button...');
    const payButton = await page.$('button[class*="btn-healthcare-primary"]');
    if (payButton) {
      await page.click('button[class*="btn-healthcare-primary"]');
      console.log('✅ Payment button clicked');
    }

    // Wait for Paystack modal to appear
    console.log('⏳ Waiting for Paystack modal...');
    try {
      // Paystack modal appears in an iframe
      await page.waitForSelector('iframe[src*="paystack"]', { timeout: 10000 });
      console.log('✅ Paystack modal appeared');
      
      // Take screenshot of modal
      await page.screenshot({ path: 'paystack-modal.png' });
      console.log('📸 Screenshot saved: paystack-modal.png');

      // Switch to Paystack iframe
      const frames = await page.frames();
      const paystackFrame = frames.find(frame => frame.url().includes('paystack'));
      
      if (paystackFrame) {
        console.log('🔄 Switched to Paystack iframe');
        
        // Fill test card details
        console.log('💳 Filling test card details...');
        
        // Wait for card input to be ready
        await paystackFrame.waitForSelector('input[placeholder*="card"], input[name*="card"], input[type="text"]', { timeout: 5000 });
        
        // Fill card number (Paystack test card)
        const cardInputs = await paystackFrame.$$('input[type="text"], input[type="tel"]');
        if (cardInputs.length > 0) {
          await cardInputs[0].type('4084084084084081'); // Paystack test card
          console.log('✅ Entered card number');
        }
        
        // Fill expiry (any future date)
        if (cardInputs.length > 1) {
          await cardInputs[1].type('12/25');
          console.log('✅ Entered expiry date');
        }
        
        // Fill CVV
        if (cardInputs.length > 2) {
          await cardInputs[2].type('123');
          console.log('✅ Entered CVV');
        }

        // Click pay button in iframe
        const payButtonInFrame = await paystackFrame.$('button[type="submit"], button:has-text("Pay")');
        if (payButtonInFrame) {
          await payButtonInFrame.click();
          console.log('✅ Clicked pay button in iframe');
        }

        // Wait for payment processing
        console.log('⏳ Waiting for payment to process...');
        await page.waitForTimeout(5000);

        // Check for success or polling status
        const buttonText = await page.evaluate(() => {
          const button = document.querySelector('button[class*="btn-healthcare-primary"]');
          return button ? button.textContent : 'Button not found';
        });
        
        console.log(`📋 Payment button text: ${buttonText}`);

        // Wait for polling to complete (up to 30 seconds)
        console.log('🔄 Waiting for payment verification...');
        let attempts = 0;
        let maxAttempts = 10; // 30 seconds total
        
        while (attempts < maxAttempts) {
          await page.waitForTimeout(3000);
          
          const currentButtonText = await page.evaluate(() => {
            const button = document.querySelector('button[class*="btn-healthcare-primary"]');
            return button ? button.textContent : 'Button not found';
          });
          
          console.log(`📋 Attempt ${attempts + 1}: Button text: ${currentButtonText}`);
          
          if (currentButtonText.includes('Successful') || currentButtonText.includes('Success')) {
            console.log('🎉 Payment verification successful!');
            break;
          } else if (currentButtonText.includes('Failed') || currentButtonText.includes('Error')) {
            console.log('❌ Payment verification failed!');
            break;
          }
          
          attempts++;
        }

        if (attempts >= maxAttempts) {
          console.log('⏱️ Payment verification timeout');
        }

      } else {
        console.log('❌ Could not find Paystack iframe');
      }

    } catch (error) {
      console.log('❌ Paystack modal did not appear:', error.message);
      
      // Check if payment button shows any error state
      const buttonText = await page.evaluate(() => {
        const button = document.querySelector('button[class*="btn-healthcare-primary"]');
        return button ? button.textContent : 'Button not found';
      });
      console.log(`📋 Payment button text: ${buttonText}`);
    }

    // Take final screenshot
    await page.screenshot({ path: 'final-state.png' });
    console.log('📸 Final screenshot saved: final-state.png');

    // Check database for payment status (would need API endpoint)
    console.log('🗄️ Checking payment status via API...');
    try {
      const response = await fetch('http://localhost:3000/api/payments/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: 'test-reference' }) // Would need actual reference
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Payment status:', result.status);
      }
    } catch (error) {
      console.log('❌ Could not check payment status via API');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
    
    if (page) {
      await page.screenshot({ path: 'error-state.png' });
      console.log('📸 Error screenshot saved: error-state.png');
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Run the test
console.log('🧪 Starting Payment Flow Test\n');
testPaymentFlow()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });