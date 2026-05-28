'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore, UserProfile } from '@/lib/store'
import { useRouter } from 'next/navigation'

/**
 * Custom React Hook to manage authenticated user session, profiles, and logout redirection.
 */
export function useUser() {
  const router = useRouter()
  const supabase = createClient()
  const { user, setUser } = useAppStore()
  const [loading, setLoading] = useState(!user)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          setUser(null)
          setLoading(false)
          return
        }

        // Fetch profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && profile) {
          setUser(profile as UserProfile)
        } else {
          // If profile sync fails (e.g. newly signed up), build fallback
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || 'Clinical Staff',
            role: session.user.user_metadata?.role || 'physician',
          })
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!user) {
      fetchUser()
    }

    // Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profile) {
            setUser(profile as UserProfile)
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name || 'Clinical Staff',
              role: session.user.user_metadata?.role || 'physician',
            })
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, setUser, user])

  const logout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
    router.refresh()
  }

  return { user, loading, logout }
}
