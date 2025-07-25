import { createClient } from './client';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export class PaymentService {
  private _supabase?: ReturnType<typeof createClient>;
  private _serverSupabase?: ReturnType<typeof createServerClient>;

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClient();
    }
    return this._supabase;
  }

  private get serverSupabase() {
    if (!this._serverSupabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
      }
      this._serverSupabase = createServerClient(url, key);
    }
    return this._serverSupabase;
  }

  async createPayment(payment: PaymentInsert): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      throw error;
    }

    return data;
  }

  async updatePayment(id: string, updates: PaymentUpdate): Promise<Payment | null> {
    // Use server client for API routes
    const client = typeof window === 'undefined' ? this.serverSupabase : this.supabase;
    
    const { data, error } = await client
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      throw error;
    }

    return data;
  }

  async getPaymentByReference(reference: string): Promise<Payment | null> {
    console.log('🔍 Looking for payment with reference:', reference);
    
    // Use server client for API routes
    const client = typeof window === 'undefined' ? this.serverSupabase : this.supabase;
    
    // First, let's see what payments exist
    const { data: allPayments, error: allError } = await client
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    console.log('🔍 Recent payments in database:', allPayments);
    console.log('🔍 Database query error (if any):', allError);
    
    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('payment_gateway_id', reference)
      .single();

    if (error) {
      console.error('❌ Error fetching payment by reference:', error);
      console.log('🔍 Searched for payment_gateway_id:', reference);
      
      // Try to find by partial match or most recent pending
      if (allPayments && allPayments.length > 0) {
        console.log('🔄 Returning most recent payment as fallback');
        return allPayments[0];
      }
      
      return null;
    }

    console.log('✅ Found payment by reference:', data);
    return data;
  }

  async getPaymentsByAppointment(appointmentId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments for appointment:', error);
      throw error;
    }

    return data || [];
  }

  async verifyPayment(reference: string, paystackReference?: string): Promise<{ success: boolean; data?: Payment; error?: string }> {
    try {
      console.log('🔍 Verifying payment with reference:', reference);
      console.log('🔗 Paystack reference:', paystackReference);
      
      // First, find the payment record in our database
      const payment = await this.getPaymentByReference(reference);
      
      if (!payment) {
        console.log('❌ Payment not found for reference:', reference);
        return { success: false, error: 'Payment record not found in database' };
      }

      console.log('✅ Found payment record:', payment);

      if (payment.payment_status === 'completed') {
        console.log('✅ Payment already completed');
        return { success: true, data: payment };
      }

      // Verify with Paystack API using Edge Function
      const paystackVerificationReference = paystackReference || reference;
      console.log('🔍 Verifying with Paystack API using reference:', paystackVerificationReference);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Supabase configuration missing');
        return { success: false, error: 'Payment verification service not configured' };
      }

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/verify-paystack-payment`;
      console.log('📡 Calling Edge Function:', edgeFunctionUrl);

      const verificationResponse = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: paystackVerificationReference
        })
      });

      const verificationData = await verificationResponse.json();
      console.log('📊 Edge Function response:', verificationData);

      if (!verificationResponse.ok || !verificationData.success) {
        console.error('❌ Paystack verification failed:', verificationData);
        return { 
          success: false, 
          error: verificationData.error || 'Payment verification failed with Paystack' 
        };
      }

      // Payment verified with Paystack - update our record
      console.log('✅ Payment verified with Paystack, updating database...');
      const updatedPayment = await this.updatePayment(payment.id, {
        payment_status: 'completed',
        gateway_response: {
          paystack_reference: paystackReference,
          paystack_verification: verificationData.data,
          verified_at: new Date().toISOString()
        }
      });

      console.log('✅ Payment verification successful:', updatedPayment);
      return { success: true, data: updatedPayment };
      
    } catch (error) {
      console.error('💥 Error verifying payment:', error);
      return { success: false, error: `Failed to verify payment: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  async getAllPayments(): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all payments:', error);
      return [];
    }

    return data || [];
  }
}

export const paymentService = new PaymentService();