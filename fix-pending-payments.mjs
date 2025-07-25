// Script to manually complete pending payments
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPendingPayments() {
  console.log('🔧 Fixing pending payments...\n');

  try {
    // Get all pending payments
    const { data: pendingPayments, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching payments:', fetchError);
      return;
    }

    console.log(`📋 Found ${pendingPayments.length} pending payments:`);
    pendingPayments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.payment_gateway_id} - R${payment.amount} (${payment.created_at})`);
    });

    if (pendingPayments.length === 0) {
      console.log('✅ No pending payments to fix');
      return;
    }

    console.log('\n🔄 Updating all pending payments to completed...');

    // Update all pending payments to completed
    const { data: updatedPayments, error: updateError } = await supabase
      .from('payments')
      .update({
        payment_status: 'completed',
        gateway_response: {
          manual_completion: true,
          completed_at: new Date().toISOString(),
          completed_by: 'manual_script',
          note: 'Manually completed via fix script'
        }
      })
      .eq('payment_status', 'pending')
      .select();

    if (updateError) {
      console.error('❌ Error updating payments:', updateError);
      return;
    }

    console.log(`✅ Updated ${updatedPayments.length} payments to completed`);

    // Update related appointments
    console.log('\n🔄 Updating related appointments...');
    
    for (const payment of updatedPayments) {
      if (payment.appointment_id) {
        const { error: appointmentError } = await supabase
          .from('appointments')
          .update({
            payment_status: 'paid',
            status: 'scheduled'
          })
          .eq('id', payment.appointment_id);

        if (appointmentError) {
          console.error(`❌ Error updating appointment ${payment.appointment_id}:`, appointmentError);
        } else {
          console.log(`✅ Updated appointment ${payment.appointment_id}`);
        }
      }
    }

    console.log('\n🎉 All pending payments have been fixed!');
    console.log('💡 Users can now see their appointments as confirmed.');

  } catch (error) {
    console.error('💥 Script failed:', error);
  }
}

// Run the script
fixPendingPayments()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });