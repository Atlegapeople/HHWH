import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reference } = await req.json()

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Payment reference is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🔍 Verifying payment with Paystack API:', reference)

    // Get Paystack secret key from environment
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Payment verification service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify payment with Paystack API
    const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`
    console.log('📡 Calling Paystack API:', verifyUrl)

    const paystackResponse = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    })

    const paystackData = await paystackResponse.json()
    console.log('📊 Paystack API response:', paystackData)

    if (!paystackResponse.ok) {
      console.error('❌ Paystack API error:', paystackData)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to verify payment with Paystack',
          details: paystackData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if payment was successful
    const isPaymentSuccessful = paystackData.status && 
                               paystackData.data && 
                               paystackData.data.status === 'success'

    if (!isPaymentSuccessful) {
      console.log('❌ Payment not successful:', paystackData.data?.status)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Payment was not successful',
          status: paystackData.data?.status,
          data: paystackData.data
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Payment verified successfully!')
    
    // Return successful verification
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        data: {
          reference: paystackData.data.reference,
          amount: paystackData.data.amount,
          currency: paystackData.data.currency,
          status: paystackData.data.status,
          paid_at: paystackData.data.paid_at,
          customer: paystackData.data.customer,
          metadata: paystackData.data.metadata,
          gateway_response: paystackData.data.gateway_response
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})