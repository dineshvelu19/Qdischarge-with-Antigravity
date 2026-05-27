import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a browser-safe client for interacting with Supabase.
 * Use this only inside Client Components ("use client").
 */
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
