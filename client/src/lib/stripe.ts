import { loadStripe } from '@stripe/stripe-js'

if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing environment variable: VITE_STRIPE_PUBLISHABLE_KEY')
}

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID 