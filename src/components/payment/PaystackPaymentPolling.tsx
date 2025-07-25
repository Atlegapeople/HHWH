'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { PaymentData, paystackService } from '@/lib/paystack';

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata: Record<string, unknown>;
  channels: string[];
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}

interface PaystackResponse {
  reference: string;
  status: string;
  transaction: string;
  message: string;
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

export function PaystackPaymentPolling({
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
  const [polling, setPolling] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'checking' | 'success' | 'error'>('idle');
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const paymentOpened = useRef(false);

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

    // Cleanup on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const checkPaymentStatus = async () => {
    console.log('🔍 Checking payment status...');
    setStatus('checking');
    
    try {
      const response = await fetch('/api/payments/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: paymentData.reference
        })
      });

      if (!response.ok) {
        console.error('❌ API Response not OK:', response.status, response.statusText);
        setStatus('processing');
        return false;
      }

      const result = await response.json();
      console.log('📊 Status check result:', result);

      if (result.status === 'completed') {
        // Payment successful!
        console.log('✅ Payment verified successfully!');
        setStatus('success');
        setPolling(false);
        setLoading(false);
        
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }

        // Call success handler
        const paystackRef = result.paystackData?.reference || result.payment?.gateway_response?.paystack_reference;
        onSuccess(paymentData.reference, paystackRef);
        
        return true;
      } else if (result.status === 'error') {
        console.error('❌ Payment verification error:', result.error);
        setStatus('error');
        setPolling(false);
        setLoading(false);
        
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
        
        onError(new Error(result.error || 'Payment verification failed'));
        return false;
      }
      
      // Still pending
      setStatus('processing');
      return false;
      
    } catch (error) {
      console.error('❌ Status check error:', error);
      setStatus('processing');
      return false;
    }
  };

  const startPolling = () => {
    console.log('🔄 Starting payment status polling...');
    setPolling(true);
    
    // Check immediately
    checkPaymentStatus();
    
    // Then check every 3 seconds
    pollingInterval.current = setInterval(async () => {
      const completed = await checkPaymentStatus();
      if (completed) {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      }
    }, 3000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      if (polling && pollingInterval.current) {
        console.log('⏱️ Polling timeout reached');
        clearInterval(pollingInterval.current);
        setPolling(false);
        setLoading(false);
        setStatus('error');
        onError(new Error('Payment verification timeout. Please contact support.'));
      }
    }, 5 * 60 * 1000);
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setStatus('processing');
      paymentOpened.current = false;
      
      // Check if service is configured
      if (!paystackService.isConfigured()) {
        setLoading(false);
        setStatus('error');
        onError(new Error('Payment system is not configured. Please contact support.'));
        return;
      }

      if (!scriptLoaded || !window.PaystackPop) {
        console.error('❌ Paystack script not loaded');
        setLoading(false);
        setStatus('error');
        onError(new Error('Payment system is still loading. Please try again.'));
        return;
      }

      initializePaystack();
    } catch (error) {
      console.error('❌ Payment error:', error);
      setLoading(false);
      setStatus('error');
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

    // Create handler
    const handler = window.PaystackPop.setup({
      key: config.key,
      email: config.email,
      amount: config.amount,
      currency: config.currency,
      ref: config.reference,
      metadata: config.metadata,
      channels: config.channels,
      callback: function(response: PaystackResponse) {
        // This might not fire, but if it does, great!
        console.log('🎉 Paystack callback fired!', response);
        setLoading(false);
        onSuccess(paymentData.reference, response.reference);
      },
      onClose: function() {
        console.log('🔴 Paystack modal closed');
        
        // If payment was opened, start polling
        if (paymentOpened.current && !polling) {
          console.log('🔄 Modal closed, starting status polling...');
          startPolling();
        } else if (!paymentOpened.current) {
          // User closed without attempting payment
          setLoading(false);
          setStatus('idle');
          onClose();
        }
      }
    });

    console.log('🚀 Opening Paystack payment modal...');
    paymentOpened.current = true;
    handler.openIframe();
  };

  const getButtonText = () => {
    switch (status) {
      case 'processing':
        return 'Processing Payment...';
      case 'checking':
        return 'Verifying Payment...';
      case 'success':
        return 'Payment Successful!';
      case 'error':
        return 'Payment Failed';
      default:
        return children || 'Pay with Card';
    }
  };

  const getButtonIcon = () => {
    switch (status) {
      case 'processing':
      case 'checking':
        return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="mr-2 h-4 w-4 text-green-600" />;
      default:
        return !children && <CreditCard className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePayment}
        disabled={disabled || loading || !scriptLoaded || status === 'success'}
        className={`btn-healthcare-primary ${className}`}
        variant={status === 'success' ? 'default' : 'default'}
      >
        {loading || polling ? (
          <>
            {getButtonIcon()}
            {getButtonText()}
          </>
        ) : !scriptLoaded ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {getButtonIcon()}
            {getButtonText()}
          </>
        )}
      </Button>
      
      {polling && (
        <p className="text-sm text-muted-foreground text-center">
          Verifying your payment with Paystack...
        </p>
      )}
    </div>
  );
}