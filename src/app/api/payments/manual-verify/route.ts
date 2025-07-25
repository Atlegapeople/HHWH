import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Manual verification endpoint to fix pending payments
export async function POST(request: NextRequest) {
  try {
    const { paystackReference } = await request.json();

    if (!paystackReference) {
      return NextResponse.json(
        { error: 'Paystack reference is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🔍 Looking for pending payment to verify with Paystack ref:', paystackReference);

    // First, verify with Paystack Edge Function
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-paystack-payment`;
    const verificationResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference: paystackReference
      })
    });

    const verificationData = await verificationResponse.json();
    console.log('📊 Paystack verification response:', verificationData);

    if (!verificationResponse.ok || !verificationData.success) {
      return NextResponse.json({
        error: 'Payment verification failed with Paystack',
        details: verificationData
      }, { status: 400 });
    }

    // Extract amount from Paystack response (in kobo, need to convert to Rand)
    const amountInRand = verificationData.data.amount / 100;

    // Find the pending payment with matching amount
    const { data: pendingPayments, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_status', 'pending')
      .eq('amount', amountInRand)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching pending payments:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      return NextResponse.json({
        error: 'No matching pending payment found',
        amountSearched: amountInRand
      }, { status: 404 });
    }

    // Update the most recent matching payment
    const paymentToUpdate = pendingPayments[0];
    console.log('✅ Found payment to update:', paymentToUpdate);

    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        payment_status: 'completed',
        gateway_response: {
          paystack_reference: paystackReference,
          paystack_verification: verificationData.data,
          verified_at: new Date().toISOString(),
          manual_verification: true
        }
      })
      .eq('id', paymentToUpdate.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating payment:', updateError);
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }

    // Update the appointment status
    if (paymentToUpdate.appointment_id) {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          payment_status: 'paid',
          status: 'scheduled'
        })
        .eq('id', paymentToUpdate.appointment_id);

      if (appointmentError) {
        console.error('❌ Error updating appointment:', appointmentError);
      }
    }

    console.log('✅ Payment manually verified and updated:', updatedPayment);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and updated successfully',
      payment: updatedPayment,
      paystackData: verificationData.data
    });

  } catch (error) {
    console.error('💥 Manual verification error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}