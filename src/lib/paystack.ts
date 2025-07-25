import { PaystackProps } from '@paystack/inline-js';

export interface PaymentData {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  metadata: {
    patient_id: string;
    doctor_id: string;
    appointment_id?: string;
    consultation_type: string;
  };
}

export interface PaystackConfig extends Omit<PaystackProps, 'key'> {
  key: string;
}

export class PaystackService {
  private publicKey: string;

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
    
    if (!this.publicKey) {
      console.warn('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set. Payment functionality will be disabled.');
    }
  }

  isConfigured(): boolean {
    return !!this.publicKey && 
           this.publicKey !== 'pk_test_your_public_key_here' && 
           this.publicKey !== 'pk_test_temp_for_development_only';
  }

  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `hhwh_${timestamp}_${random}`;
  }

  createPaymentConfig(data: PaymentData): PaystackConfig {
    if (!this.isConfigured()) {
      throw new Error('Paystack is not properly configured. Please set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.');
    }

    console.log('🔧 Creating Paystack config with data:', data);

    const config: PaystackConfig = {
      key: this.publicKey,
      email: data.email,
      amount: data.amount * 100, // Convert to kobo
      currency: data.currency || 'ZAR',
      reference: data.reference,
      metadata: data.metadata,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    };

    console.log('🔧 Base config created:', config);
    return config;
  }

  async initializePayment(paymentData: PaymentData): Promise<PaystackConfig> {
    // Generate reference if not provided
    if (!paymentData.reference) {
      paymentData.reference = this.generateReference();
    }

    return this.createPaymentConfig(paymentData);
  }
}

export const paystackService = new PaystackService();