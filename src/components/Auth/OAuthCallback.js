import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FullPageLoader } from '../common/LoadingSpinner'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('OAuthCallback: Component mounted')
    console.log('OAuthCallback: Initial user state:', { user: user?.email, loading })

    const handleOAuthCallback = async () => {
      try {
        // Check URL for any error parameters from OAuth
        const urlParams = new URLSearchParams(window.location.search)
        const errorParam = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')
        
        if (errorParam) {
          console.error('OAuthCallback: OAuth error:', { errorParam, errorDescription })
          setError(`OAuth Error: ${errorDescription || errorParam}`)
          setTimeout(() => navigate('/login', { replace: true }), 3000)
          return
        }

        console.log('OAuthCallback: Processing OAuth callback...')
        
        // Small delay to ensure auth state is processed
        const checkAuthState = () => {
          console.log('OAuthCallback: Checking auth state...')
          
          if (user) {
            console.log('OAuthCallback: User authenticated successfully:', user.email)
            navigate('/dashboard', { replace: true })
          } else if (!loading) {
            console.log('OAuthCallback: User not authenticated, checking again...')
            // Give it one more check after a longer delay
            setTimeout(() => {
              if (!user) {
                console.log('OAuthCallback: User still not authenticated, redirecting to login')
                navigate('/login', { replace: true })
              }
            }, 2000)
          }
        }

        // Initial check
        checkAuthState()

      } catch (error) {
        console.error('OAuthCallback: Error handling OAuth callback:', error)
        setError('Failed to complete sign in')
        setTimeout(() => navigate('/login', { replace: true }), 3000)
      }
    }

    handleOAuthCallback()
  }, [user, loading, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <div className="text-sm text-gray-600">Redirecting to login...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <FullPageLoader message="Completing sign in..." />
    </div>
  )
}

export default OAuthCallback