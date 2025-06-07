import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

// @supabase/functions-js
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// This tells Supabase that this function should be publicly accessible
// @supabase/functions-js
export const config = {
  auth: {
    public: true
  }
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

// Custom function to verify Stripe signature using Deno's native crypto
async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const EXPECTED_SCHEME = "v1="
  
  const signatureParts = header.split(',').map(part => part.trim())
  const signatureHeader = signatureParts.find(part => part.startsWith(EXPECTED_SCHEME))
  
  if (!signatureHeader) {
    throw new Error('Invalid signature header format')
  }

  const signature = signatureHeader.slice(EXPECTED_SCHEME.length)
  const timestamp = signatureParts[0].split('=')[1]
  
  // Create the signed payload
  const signedPayload = `${timestamp}.${payload}`
  
  // Convert secret to crypto key
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  )
  
  // Convert signature to Uint8Array
  const signatureBytes = new Uint8Array(
    signature.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
  )
  
  // Verify the signature
  return await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(signedPayload)
  )
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests for webhook events
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const signature = req.headers.get('stripe-signature')

    if (!signature || !endpointSecret) {
      console.error('Missing signature or endpoint secret')
      return new Response(
        JSON.stringify({ error: 'Invalid webhook request' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const body = await req.text()
    
    // Verify the signature using our custom function
    const isValid = await verifyStripeSignature(body, signature, endpointSecret)
    
    if (!isValid) {
      throw new Error('Invalid signature')
    }

    // Parse the event data
    const event = JSON.parse(body)

    console.log('Received verified Stripe event:', event.type)

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      console.log('Processing completed session for user:', session.client_reference_id)

      // Create Supabase client with service role key for admin access
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Update the user's paid status
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ is_paid: true })
        .eq('id', session.client_reference_id)
        .select()

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      console.log('Successfully updated profile for user:', session.client_reference_id)
    }

    return new Response(
      JSON.stringify({ received: true }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (err) {
    // Log the full error for debugging
    console.error('Error processing webhook:', err)
    
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', message: err.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})