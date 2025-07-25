// Script to fix pending payments by matching with Paystack transactions
const paystackTransactions = [
  { amount: 850, reference: 'T916268743898471', time: '9:30 PM' },
  { amount: 850, reference: 'T367932398925785', time: '9:28 PM' },
  { amount: 850, reference: 'T116124695347612', time: '9:26 PM' },
  { amount: 800, reference: 'T487672963771962', time: '9:21 PM' },
  { amount: 750, reference: 'T893500595094306', time: '9:20 PM' },
  { amount: 800, reference: 'T720863897455183', time: '9:03 PM' },
  { amount: 850, reference: 'T574238351522435', time: '9:01 PM' },
  { amount: 850, reference: 'T365487053755028', time: '8:58 PM' },
  { amount: 800, reference: 'T590366751614129', time: '8:54 PM' },
  { amount: 800, reference: 'T235011715136528', time: '8:49 PM' },
  { amount: 850, reference: 'T081189881922068', time: '8:44 PM' },
  { amount: 950, reference: 'T128813909317776', time: '8:38 PM' },
  { amount: 800, reference: 'T418961956825092', time: '8:34 PM' },
  { amount: 800, reference: 'T943389763834460', time: '8:32 PM' },
  { amount: 800, reference: 'T665615411730268', time: '8:30 PM' },
  { amount: 750, reference: 'T530827559576415', time: '8:24 PM' },
  { amount: 850, reference: 'T554067176428412', time: '8:17 PM' },
  { amount: 850, reference: 'T260920916619838', time: '8:15 PM' },
  { amount: 800, reference: 'T491527218195602', time: '8:12 PM' }
];

console.log('🔧 Fixing pending payments...\n');

// Function to verify each payment
async function verifyPayment(transaction) {
  console.log(`\n💳 Verifying ${transaction.reference} (R${transaction.amount})...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/payments/manual-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paystackReference: transaction.reference
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ Successfully verified and updated payment!`);
      console.log(`   Payment ID: ${result.payment.id}`);
      console.log(`   Appointment ID: ${result.payment.appointment_id}`);
    } else {
      console.log(`❌ Failed to verify: ${result.error || 'Unknown error'}`);
      if (result.details) {
        console.log(`   Details:`, result.details);
      }
    }
  } catch (error) {
    console.error(`💥 Error verifying payment:`, error.message);
  }
}

// Process all transactions
async function processAll() {
  console.log(`📋 Processing ${paystackTransactions.length} Paystack transactions...`);
  
  for (const transaction of paystackTransactions) {
    await verifyPayment(transaction);
    // Add delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ Finished processing all transactions!');
}

// Run the script
processAll().catch(console.error);