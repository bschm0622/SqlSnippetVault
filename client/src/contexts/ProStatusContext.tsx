import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface ProStatusContextType {
  isPro: boolean
  isLoading: boolean
  refreshProStatus: () => Promise<void>
}

const ProStatusContext = createContext<ProStatusContextType | undefined>(undefined)

export function ProStatusProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isPro, setIsPro] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProStatus = async () => {
    try {
      if (!user) {
        setIsPro(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('is_paid')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setIsPro(data?.is_paid ?? false)
    } catch (error) {
      console.error('Error fetching pro status:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch pro status. Some features may be unavailable."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProStatus = async () => {
    setIsLoading(true)
    await fetchProStatus()
  }

  useEffect(() => {
    fetchProStatus()
  }, [user?.id])

  const value = {
    isPro,
    isLoading,
    refreshProStatus
  }

  return (
    <ProStatusContext.Provider value={value}>
      {children}
    </ProStatusContext.Provider>
  )
}

export function useProStatus() {
  const context = useContext(ProStatusContext)
  if (context === undefined) {
    throw new Error('useProStatus must be used within a ProStatusProvider')
  }
  return context
}