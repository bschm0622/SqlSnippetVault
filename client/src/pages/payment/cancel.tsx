import { useLocation } from 'wouter'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentCancel() {
  const [, setLocation] = useLocation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-6 text-center">
        <div className="flex justify-center">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          Your payment was cancelled. No charges were made.
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