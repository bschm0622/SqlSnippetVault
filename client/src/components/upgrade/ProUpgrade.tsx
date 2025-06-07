import { useProStatus } from '@/contexts/ProStatusContext'
import { useAuth } from '@/contexts/AuthContext'
import { UpgradeButton } from './UpgradeButton'

export function ProUpgrade() {
  const { user } = useAuth()
  const { isPro, isLoading } = useProStatus()

  if (isLoading || !user || isPro) {
    return null
  }

  return <UpgradeButton />
} 