import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Github } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function GitHubLoginButton() {
  const { signInWithGitHub } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      await signInWithGitHub()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Failed to sign in with GitHub. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogin}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
          Connecting...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Sign in with GitHub
        </span>
      )}
    </Button>
  )
} 