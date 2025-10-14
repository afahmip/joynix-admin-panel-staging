import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type User = {
  id: string
  username: string
  full_name?: string
  email?: string
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
}

type SignInResponse = {
  session_id: string
  expires_in: number
  message: string
  delivery_method: string
  contact_masked: string
}

type VerifyOtpResponse = {
  access_token: string
  refresh_token: string
  id_token: string
  token_type: 'Bearer'
  expires_in: number
  auth_method: string
  is_new_user: boolean
  user: User
}

type RefreshTokenResponse = {
  access_token: string
  expires_in: number
  id_token: string
  refresh_token: string
  token_type: string
}

type AuthContextValue = AuthState & {
  isAuthenticated: boolean
  signin: (identifier: string) => Promise<SignInResponse>
  verifyOtp: (sessionId: string, otp: string) => Promise<VerifyOtpResponse>
  refreshToken: () => Promise<RefreshTokenResponse>
  signout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'joynix_admin_auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { accessToken: null, refreshToken: null, user: null }
      return JSON.parse(raw) as AuthState
    } catch {
      return { accessToken: null, refreshToken: null, user: null }
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value: AuthContextValue = useMemo(() => {
    return {
      ...state,
      isAuthenticated: !!state.accessToken,
      async signin(identifier: string) {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL_DEV || 'https://stg.joynix.id/api/v1/'}auth/otp-signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier }),
        })
        if (!res.ok) throw new Error('Failed to initiate sign in')
        return res.json()
      },
      async verifyOtp(sessionId: string, otp: string) {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL_DEV || 'https://stg.joynix.id/api/v1/'}auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, otp }),
        })
        if (!res.ok) throw new Error('Failed to verify OTP')
        const data = (await res.json()) as VerifyOtpResponse
        setState({ accessToken: data.access_token, refreshToken: data.refresh_token, user: data.user })
        return data
      },
      async refreshToken() {
        if (!state.refreshToken || !state.user) {
          throw new Error('No refresh token or user available')
        }
        
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL_DEV || 'https://stg.joynix.id/api/v1/'}auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            refresh_token: state.refreshToken, 
            user_id: state.user.id 
          }),
        })
        
        if (!res.ok) throw new Error('Failed to refresh token')
        const data = (await res.json()) as RefreshTokenResponse
        
        setState(prev => ({ 
          ...prev, 
          accessToken: data.access_token, 
          refreshToken: data.refresh_token 
        }))
        
        return data
      },
      signout() {
        setState({ accessToken: null, refreshToken: null, user: null })
      },
    }
  }, [state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


