'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { PaymentData, paystackService } from '@/lib/paystack';
import { LoadingSpinner } from '@/components/ui/loading';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaystackPaymentProps {
  paymentData: PaymentData;
  onSuccess: (reference: string, paystackReference?: string) => void;
  onError: (error: unknown) => void;
  onClose: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function PaystackPaymentFixed({
  paymentData,
  onSuccess,
  onError,
  onClose,
  disabled = false,
  children,
  className = ""
}: PaystackPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Paystack script
    if (typeof window !== 'undefined' && !window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Paystack script loaded');
        setScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Paystack script');
      };
      document.head.appendChild(script);
    } else if (window.PaystackPop) {
      setScriptLoaded(true);
    }
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Check if service is configured
      if (!paystackService.isConfigured()) {
        setLoading(false);
        onError(new Error('Payment system is not configured. Please contact support.'));
        return;
      }

      if (!scriptLoaded || !window.PaystackPop) {
        console.error('❌ Paystack script not loaded');
        setLoading(false);
        onError(new Error('Payment system is still loading. Please try again.'));
        return;
      }

      initializePaystack();
    } catch (error) {
      console.error('❌ Payment error:', error);
      setLoading(false);
      onError(error);
    }
  };

  const initializePaystack = () => {
    console.log('🔧 Initializing Paystack payment...');
    console.log('📋 Payment data:', paymentData);

    const config = paystackService.createPaymentConfig(paymentData);
    console.log('🔧 Paystack configuration:', {
      ...config,
      key: config.key ? '***' + config.key.slice(-4) : 'not set'
    });

    // Create handler with inline configuration
    const handler = window.PaystackPop.setup({
      key: config.key,
      email: config.email,
      amount: config.amount,
      currency: config.currency,
      ref: config.reference, // Use 'ref' instead of 'reference'
      metadata: config.metadata,
      channels: config.channels,
      callback: function(response: any) {
        // This is the main success callback
        console.log('🎉🎉🎉 PAYSTACK SUCCESS CALLBACK FIRED!');
        console.log('✅ Payment response:', response);
        
        setLoading(false);
        
        // Call our success handler with both references
        const paystackRef = response.reference || response.trxref || response.trans;
        console.log('📋 Our reference:', paymentData.reference);
        console.log('📋 Paystack reference:', paystackRef);
        
        onSuccess(paymentData.reference, paystackRef);
      },
      onClose: function() {
        console.log('🔴 Paystack modal closed');
        setLoading(false);
        
        // Check if payment might have succeeded
        setTimeout(() => {
          if (confirm('Did your payment complete successfully? Click OK if you saw a success message.')) {
            console.log('👤 User confirmed payment success');
            onSuccess(paymentData.reference, 'USER_CONFIRMED');
          } else {
            console.log('👤 User cancelled/failed payment');
            onClose();
          }
        }, 500);
      }
    });

    console.log('🚀 Opening Paystack payment modal...');
    handler.openIframe();
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading || !scriptLoaded}
      className={`btn-healthcare-primary ${className}`}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Processing...
        </>
      ) : !scriptLoaded ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Loading...
        </>
      ) : (
        <>
          {children || (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay with Card
            </>
          )}
        </>
      )}
    </Button>
  );
}