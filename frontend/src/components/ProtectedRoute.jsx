/**
 * Protected Route Guard
 * Blocks beta users from accessing full app features
 * Beta users can only access: Home, Beta Program, Contact, Privacy, Terms
 */

import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  console.log('ProtectedRoute check:', { user, loading, role: user?.role })

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in - redirect to home/login
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Beta user - redirect to beta welcome page
  if (user.role === "beta") {
    return <Navigate to="/beta-welcome" replace />
  }

  // Authorized - render protected content
  return children
}
