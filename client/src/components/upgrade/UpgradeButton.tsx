import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function UpgradeButton() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to upgrade to Pro."
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Call your Supabase Edge Function to create a Stripe Checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          email: user.email,
          userId: user.id,
          returnUrl: window.location.origin
        }
      })

      if (error) throw error

      // Redirect to Stripe Checkout
      window.location.href = data.url

    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start checkout process. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isLoading}
      className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Processing...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Upgrade to Pro
        </span>
      )}
    </Button>
  )
} 