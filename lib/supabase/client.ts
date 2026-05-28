import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a browser-safe client for interacting with Supabase.
 * Use this only inside Client Components ("use client").
 */
export const createClient = (): ReturnType<typeof createBrowserClient> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // Return a safe mock client during server-side build/prerendering
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
          }),
          order: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, anonKey)
}
