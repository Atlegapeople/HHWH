import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Paystack webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('📨 Paystack webhook received:', event.event);

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const { reference, amount, customer, paid_at, metadata } = event.data;
      
      console.log('💳 Payment successful via webhook:');
      console.log('- Reference:', reference);
      console.log('- Amount:', amount / 100, 'ZAR');
      console.log('- Customer:', customer.email);

      // Initialize Supabase with service role
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Find the payment by our reference (stored in metadata)
      const ourReference = metadata?.reference || reference;
      
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_gateway_id', ourReference)
        .single();

      if (fetchError || !payment) {
        console.error('❌ Payment not found:', ourReference);
        return NextResponse.json({ received: true });
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          payment_status: 'completed',
          gateway_response: {
            paystack_reference: reference,
            webhook_received: true,
            paid_at,
            customer,
            amount,
            event: event.data
          }
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('❌ Error updating payment:', updateError);
      } else {
        console.log('✅ Payment updated via webhook');

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
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('💥 Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}