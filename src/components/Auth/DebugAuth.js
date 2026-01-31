import React, { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

const DebugAuth = () => {
  const [authInfo, setAuthInfo] = useState({
    session: null,
    user: null,
    url: window.location.href,
    params: Object.fromEntries(new URLSearchParams(window.location.search)),
    localStorage: {
      token: localStorage.getItem('token'),
      supabaseToken: localStorage.getItem('sb-rntcoumqzcopargmjqxm-auth-token')
    }
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const { data: { user } } = await supabase.auth.getUser()
        
        setAuthInfo(prev => ({
          ...prev,
          session,
          user
        }))
      } catch (error) {
        console.error('DebugAuth: Error checking auth:', error)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Debug Auth Info</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Current URL:</strong> {authInfo.url}</div>
        <div><strong>URL Params:</strong> {JSON.stringify(authInfo.params, null, 2)}</div>
        <div><strong>Local Storage:</strong> {JSON.stringify(authInfo.localStorage, null, 2)}</div>
        <div><strong>Session:</strong> {authInfo.session ? 'Active' : 'None'}</div>
        <div><strong>User:</strong> {authInfo.user?.email || 'None'}</div>
      </div>
    </div>
  )
}

export default DebugAuth