"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthChange, signIn, signUp, signOut, resetPassword, signInWithGoogle } from "@/lib/firebase/auth"
import { loginWithFirebaseToken, getCurrentUser } from "@/lib/api/authService"
import { setBackendTokens, clearBackendTokens } from "@/lib/api/httpClient"
import { auth } from "@/lib/firebase/config"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Skip auth initialization if Firebase is not available (e.g., in tests)
    if (!auth) {
      console.warn('⚠️ Firebase auth not available - skipping auth initialization');
      setLoading(false);
      return () => {};  // Return cleanup function
    }
    
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Exchange Firebase ID token for backend JWT tokens FIRST
          const firebaseIdToken = await firebaseUser.getIdToken()
          const backendResponse = await loginWithFirebaseToken(firebaseIdToken)
          
          // Extract tokens from response structure: { user: {...}, tokens: { accessToken, refreshToken } }
          const accessToken = backendResponse.tokens?.accessToken || backendResponse.accessToken
          const refreshToken = backendResponse.tokens?.refreshToken || backendResponse.refreshToken
          const userData = backendResponse.user || backendResponse
          
          // Store backend JWT tokens
          if (accessToken && refreshToken) {
            setBackendTokens(accessToken, refreshToken)
            console.log('✅ Backend JWT tokens obtained and stored')
          } else {
            console.warn('⚠️ Backend login successful but no tokens received:', backendResponse)
          }
          
          // Use user data from token exchange response (already includes role)
          setUser({ 
            ...firebaseUser, 
            callSign: userData?.callSign || "",
            isAdmin: userData?.isAdmin || false,
            role: userData?.role || "user"
          })
          
          console.log('✅ User profile loaded from token exchange', { 
            isAdmin: userData?.isAdmin,
            role: userData?.role,
            callSign: userData?.callSign,
            fullUserData: userData
          })
        } catch (e) {
          console.error('❌ Failed to authenticate with backend:', e)
          // Still set user with Firebase data so they can at least view public pages
          setUser({ ...firebaseUser, callSign: "", isAdmin: false, role: "user" })
        }
      } else {
        setUser(null)
        clearBackendTokens()
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSignIn = async (email, password) => {
    try {
      setError(null)
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in")
      throw err
    }
  }

  const handleSignUp = async (email, password, displayName, callSign, metadata = {}) => {
    try {
      setError(null)
      await signUp(email, password, displayName, callSign, metadata)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up")
      throw err
    }
  }

  const handleSignInWithGoogle = async () => {
    try {
      setError(null)
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google")
      throw err
    }
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      clearBackendTokens()
      await signOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out")
      throw err
    }
  }

  const handleResetPassword = async (email) => {
    try {
      setError(null)
      await resetPassword(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
