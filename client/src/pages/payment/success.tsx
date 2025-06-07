import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useProStatus } from '@/contexts/ProStatusContext'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentSuccess() {
  const [, setLocation] = useLocation()
  const { refreshProStatus } = useProStatus()

  useEffect(() => {
    // Refresh the pro status to reflect the payment
    refreshProStatus()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">Thank You!</h1>
        <p className="text-muted-foreground">
          Your payment was successful. You now have access to all pro features!
        </p>
        <Button
          onClick={() => setLocation('/')}
          className="w-full"
        >
          Return to App
        </Button>
      </div>
    </div>
  )
}
