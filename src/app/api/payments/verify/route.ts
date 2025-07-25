import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/supabase/payments';
import { appointmentService } from '@/lib/supabase/appointments';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Payment verification API called');
    
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    const { reference, paystackReference, appointmentId } = body;

    if (!reference) {
      console.log('❌ Missing reference in request');
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    console.log('🎯 Verifying payment with reference:', reference);
    console.log('🔗 Paystack transaction reference:', paystackReference);
    console.log('📝 Appointment ID:', appointmentId);

    // Verify payment with our database
    console.log('🔎 Calling paymentService.verifyPayment...');
    const verificationResult = await paymentService.verifyPayment(reference, paystackReference);
    console.log('📊 Verification result:', verificationResult);

    if (!verificationResult.success) {
      console.log('❌ Payment verification failed:', verificationResult.error);
      return NextResponse.json(
        { error: verificationResult.error || 'Payment verification failed' },
        { status: 400 }
      );
    }

    // If appointment ID is provided, update the appointment payment status
    if (appointmentId) {
      try {
        console.log('📝 Updating appointment status...');
        await appointmentService.updateAppointment(appointmentId, {
          payment_status: 'paid',
          status: 'scheduled'
        });
        console.log('✅ Appointment updated successfully');
      } catch (error) {
        console.error('❌ Error updating appointment:', error);
        // Don't fail the entire request if appointment update fails
      }
    }

    console.log('🎉 Payment verification completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: verificationResult.data
    });

  } catch (error) {
    console.error('💥 Payment verification API error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}