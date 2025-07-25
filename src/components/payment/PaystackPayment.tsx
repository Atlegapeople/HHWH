'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { PaymentData, paystackService } from '@/lib/paystack';

interface PaystackPaymentProps {
  paymentData: PaymentData;
  onSuccess: (reference: string, paystackReference?: string) => void;
  onError: (error: unknown) => void;
  onClose: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function PaystackPayment({
  paymentData,
  onSuccess,
  onError,
  onClose,
  disabled = false,
  children,
  className = ""
}: PaystackPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Check if service is configured
      if (!paystackService.isConfigured()) {
        setLoading(false);
        onError(new Error('Payment system is not configured. Please contact support.'));
        return;
      }
      
      // Load Paystack script if not already loaded
      if (typeof window !== 'undefined' && !(window as unknown as { PaystackPop?: unknown }).PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => initializePaystack();
        document.head.appendChild(script);
      } else {
        initializePaystack();
      }
    } catch (error) {
      setLoading(false);
      onError(error);
    }
  };

  const initializePaystack = () => {
    console.log('🔧 Setting up Paystack handlers...');
    console.log('🔧 PaymentData received:', paymentData);
    
    // Test all possible callback variations to see which one works
    const paystackCallback = (response: any) => {
      console.log('🎉🎉🎉 PAYSTACK CALLBACK FIRED!');
      console.log('🎉 Callback response:', response);
      console.log('🔗 Paystack transaction reference:', response?.reference);
      console.log('🔗 Our payment reference:', paymentData.reference);
      
      // Force UI update immediately
      setLoading(false);
      
      // Show alert to confirm callback fired
      alert('Payment callback fired! Check console for details.');
      
      // Call onSuccess handler
      console.log('📞 Calling our success handler...');
      const referenceToUse = response?.reference || paymentData.reference;
      Promise.resolve(onSuccess(paymentData.reference, referenceToUse))
        .then(() => console.log('✅ Success handler completed'))
        .catch(error => {
          console.error('❌ Error in success callback:', error);
          // Don't fail the user experience even if verification fails
        });
    };
    
    const onSuccessCallback = (transaction: any) => {
      console.log('🎉🎉🎉 PAYSTACK ONSUCCESS FIRED!', transaction);
      paystackCallback(transaction);
    };
    
    const config = paystackService.createPaymentConfig(paymentData);
    
    // Try all possible callback methods
    config.callback = paystackCallback;
    config.onSuccess = onSuccessCallback;
    
    config.onClose = () => {
      console.log('🔴🔴🔴 PAYSTACK CLOSE CALLBACK FIRED - user closed modal');
      alert('Payment modal closed! Did payment complete?');
      // Add a delay then check if payment might have succeeded anyway
      setTimeout(() => {
        console.log('⏰ Checking if payment completed despite modal close...');
        // Since we can't reliably detect success after close, ask user
        const userConfirm = confirm('Did your payment complete successfully? Click OK if you saw a success message.');
        if (userConfirm) {
          console.log('👤 User confirmed payment success');
          Promise.resolve(onSuccess(paymentData.reference, 'USER_CONFIRMED'))
            .catch(error => console.error('❌ Error in user-confirmed success:', error));
        } else {
          console.log('👤 User confirmed payment failed/cancelled');
          setLoading(false);
          onClose();
        }
      }, 2000);
    };
    
    config.onError = (error: unknown) => {
      console.error('❌❌❌ PAYSTACK ERROR CALLBACK FIRED:', error);
      alert('Payment error occurred! Check console.');
      setLoading(false);
      onError(error);
    };
    
    console.log('🔧 Final Paystack config:', config);
    console.log('🔧 Config keys:', Object.keys(config));
    
    const PaystackPop = (window as unknown as { PaystackPop: { setup: (config: unknown) => { openIframe: () => void } } }).PaystackPop;
    
    console.log('🔧 PaystackPop object:', PaystackPop);
    
    try {
      const handler = PaystackPop.setup(config);
      console.log('🔧 Paystack handler created:', handler);
      
      console.log('🚀 Opening Paystack iframe...');
      handler.openIframe();
      
      // Test if callbacks are preserved after setup
      setTimeout(() => {
        console.log('🔍 Checking if callbacks still exist after setup...');
        console.log('🔍 config.callback exists:', typeof config.callback);
        console.log('🔍 config.onSuccess exists:', typeof config.onSuccess);
        console.log('🔍 config.onClose exists:', typeof config.onClose);
      }, 1000);
      
    } catch (error) {
      console.error('💥 Error setting up Paystack:', error);
      alert('Error setting up Paystack: ' + error);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={`btn-healthcare-primary ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
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