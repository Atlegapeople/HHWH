import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check payment status by polling Paystack
export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    console.log('🔍 Checking payment status for:', reference);

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check our database first
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_gateway_id', reference)
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({ 
        status: 'not_found',
        error: 'Payment not found in database' 
      });
    }

    console.log('📋 Payment found:', payment);

    // If already completed, return success
    if (payment.payment_status === 'completed') {
      console.log('✅ Payment already completed');
      return NextResponse.json({ 
        status: 'completed',
        payment,
        message: 'Payment already verified' 
      });
    }

    // Check with Paystack API using our custom reference
    console.log('🔍 Checking with Paystack API using reference:', reference);
    
    // First try to find transaction by our custom reference
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paystackData = await paystackResponse.json();
    console.log('📊 Paystack response:', paystackData);

    if (!paystackResponse.ok) {
      // Try with Edge Function as fallback
      console.log('🔄 Trying Edge Function verification...');
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-paystack-payment`;
      const edgeResponse = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference })
      });

      if (!edgeResponse.ok) {
        return NextResponse.json({ 
          status: 'pending',
          message: 'Payment verification pending' 
        });
      }

      const edgeData = await edgeResponse.json();
      paystackData.data = edgeData.data;
    }

    // Check if payment was successful
    if (paystackData.status && paystackData.data?.status === 'success') {
      console.log('✅ Payment successful on Paystack!');

      // Update our database
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          payment_status: 'completed',
          gateway_response: {
            paystack_reference: paystackData.data.reference,
            paystack_verification: paystackData.data,
            verified_at: new Date().toISOString(),
            verified_by: 'polling'
          }
        })
        .eq('id', payment.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating payment:', updateError);
        return NextResponse.json({ 
          status: 'error',
          error: 'Failed to update payment status' 
        });
      }

      // Update appointment status
      if (payment.appointment_id) {
        await supabase
          .from('appointments')
          .update({
            payment_status: 'paid',
            status: 'scheduled'
          })
          .eq('id', payment.appointment_id);
      }

      console.log('✅ Payment verified and updated!');
      return NextResponse.json({ 
        status: 'completed',
        payment: updatedPayment,
        paystackData: paystackData.data 
      });
    }

    // Payment not successful yet
    return NextResponse.json({ 
      status: 'pending',
      message: 'Payment not yet successful',
      paystackStatus: paystackData.data?.status 
    });

  } catch (error) {
    console.error('💥 Status check error:', error);
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}