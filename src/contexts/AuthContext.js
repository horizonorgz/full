import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, auth } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('AuthContext: Initializing auth context...')
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...')
        const { session, error } = await auth.getSession()
        console.log('AuthContext: Initial session result:', { session: !!session, error })
        
        if (error) {
          console.error('AuthContext: Error getting session:', error)
          setError(error.message)
        } else {
          setSession(session)
          setUser(session?.user || null)
          
          // Store JWT token for API requests
          if (session?.access_token) {
            localStorage.setItem('token', session.access_token)
            console.log('AuthContext: Initial JWT token stored')
          }
        }
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', { event, hasSession: !!session, user: session?.user?.email })
        setSession(session)
        setUser(session?.user || null)
        
        // Store JWT token in localStorage for API requests
        if (session?.access_token) {
          localStorage.setItem('token', session.access_token)
          console.log('AuthContext: JWT token stored in localStorage')
        } else {
          localStorage.removeItem('token')
          console.log('AuthContext: JWT token removed from localStorage')
        }
        
        setLoading(false)
        setError(null)
        
        // Handle specific events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthContext: User signed in:', session.user.email)
          // Force a small delay to ensure token is properly stored
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('userSignedIn', { detail: { user: session.user } }))
          }, 100)
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out')
          // Clear any remaining data
          localStorage.removeItem('token')
          window.dispatchEvent(new CustomEvent('userSignedOut'))
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await auth.signUp(email, password)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear JWT token from localStorage immediately
      localStorage.removeItem('token')
      console.log('JWT token cleared on sign out')
      
      const { error } = await auth.signOut()
      
      // Clear user and session state immediately
      setUser(null)
      setSession(null)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await auth.resetPassword(email)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await auth.signInWithGoogle()
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearError,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
