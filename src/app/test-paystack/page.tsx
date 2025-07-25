'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestPaystack() {
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testPayment = () => {
    addLog('Starting test payment...');
    setStatus('loading');

    // Load Paystack script if not loaded
    if (typeof window !== 'undefined' && !(window as any).PaystackPop) {
      addLog('Loading Paystack script...');
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => {
        addLog('✅ Paystack script loaded');
        initPaystack();
      };
      script.onerror = () => {
        addLog('❌ Failed to load Paystack script');
        setStatus('error');
      };
      document.head.appendChild(script);
    } else {
      initPaystack();
    }
  };

  const initPaystack = () => {
    addLog('Initializing Paystack...');
    
    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) {
      addLog('❌ PaystackPop not available');
      setStatus('error');
      return;
    }

    const testRef = `test_${Date.now()}`;
    addLog(`Using reference: ${testRef}`);

    try {
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: 'test@example.com',
        amount: 10000, // R100 in kobo
        currency: 'ZAR',
        ref: testRef,
        callback: function(response: any) {
          addLog('🎉 CALLBACK FIRED!');
          addLog(`Response: ${JSON.stringify(response)}`);
          setStatus('success');
          alert('Callback fired! Check logs.');
        },
        onClose: function() {
          addLog('🔴 Modal closed');
          if (status !== 'success') {
            setStatus('closed');
          }
        }
      });

      addLog('Opening Paystack modal...');
      handler.openIframe();
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Paystack Test Page</h1>
      
      <div className="mb-6">
        <Button onClick={testPayment} disabled={status === 'loading'}>
          {status === 'loading' ? 'Processing...' : 'Test Payment (R100)'}
        </Button>
      </div>

      <div className="mb-4">
        <strong>Status:</strong> {status || 'Ready'}
      </div>

      <div className="mb-4">
        <strong>Public Key:</strong> {process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? 
          `...${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.slice(-8)}` : 
          'Not set'}
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Logs:</h3>
        <div className="space-y-1 text-sm font-mono">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>This is a minimal test to check if Paystack callbacks work.</p>
        <p>Use test card: 4084084084084081, any future date, any CVV</p>
      </div>
    </div>
  );
}