import { NextResponse } from 'next/server';
import { paymentService } from '@/lib/supabase/payments';
import { appointmentService } from '@/lib/supabase/appointments';

export async function POST() {
  try {
    console.log('🧪 TEST: Payment verification API called');
    
    // Test with the most recent payment
    const reference = 'hhwh_1753392107560_82';
    const paystackReference = 'T491527218195602'; 
    const appointmentId = 'f3a3a8c3-4427-4ef8-8c7b-40d92796e617';

    console.log('🧪 TEST: Using reference:', reference);
    console.log('🧪 TEST: Using Paystack reference:', paystackReference);
    console.log('🧪 TEST: Using appointment ID:', appointmentId);

    // Verify payment with our database
    console.log('🧪 TEST: Calling paymentService.verifyPayment...');
    const verificationResult = await paymentService.verifyPayment(reference, paystackReference);
    console.log('🧪 TEST: Verification result:', verificationResult);

    if (!verificationResult.success) {
      console.log('🧪 TEST: Payment verification failed:', verificationResult.error);
      return NextResponse.json({
        success: false,
        error: verificationResult.error || 'Payment verification failed'
      }, { status: 400 });
    }

    // If appointment ID is provided, update the appointment payment status
    if (appointmentId) {
      try {
        console.log('🧪 TEST: Updating appointment status...');
        await appointmentService.updateAppointment(appointmentId, {
          payment_status: 'paid',
          appointment_status: 'scheduled'
        });
        console.log('🧪 TEST: Appointment updated successfully');
      } catch (error) {
        console.error('🧪 TEST: Error updating appointment:', error);
        // Don't fail the entire request if appointment update fails
      }
    }

    console.log('🧪 TEST: Payment verification completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: verificationResult.data
    });

  } catch (error) {
    console.error('🧪 TEST: Payment verification API error:', error);
    return NextResponse.json({
      success: false,
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}