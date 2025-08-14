// Fixed useAuth hook - Uses Nhost hooks properly
import { useAuthenticationStatus, useUserData } from '@nhost/react'

export const useAuth = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  const user = useUserData()

  return {
    isAuthenticated,
    isLoading,
    user
  }
}