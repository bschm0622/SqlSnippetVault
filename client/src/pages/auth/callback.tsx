import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const [, setLocation] = useLocation()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) throw error
        
        // Redirect to the main page after successful authentication
        setLocation('/')
      } catch (error) {
        console.error('Error during auth callback:', error)
        setLocation('/auth/error')
      }
    }

    handleCallback()
  }, [setLocation])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <h2 className="text-lg font-semibold mb-2">Completing login...</h2>
        <p className="text-sm text-muted-foreground">Please wait while we set up your session.</p>
      </div>
    </div>
  )
} 