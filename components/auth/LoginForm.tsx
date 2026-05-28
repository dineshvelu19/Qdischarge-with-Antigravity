'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import Link from 'next/link'

const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid clinical email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters long'),
})

type LoginFormInputs = zod.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        setError(signInError.message)
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('An unexpected error occurred during sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (oauthError) setError(oauthError.message)
    } catch (err) {
      setError('OAuth redirection failed.')
    }
  }

  return (
    <div className="w-full max-w-md p-8 rounded-2xl glass border border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl font-bold text-white mb-2">Sign In to Qdischarge</h2>
        <p className="text-xs text-ink3">Physician Workflow & Handoff Platform</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-l/15 border border-red-500/30 text-xs text-red-300 leading-relaxed">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink3 mb-2">Clinical Email</label>
          <input
            type="email"
            {...register('email')}
            placeholder="e.g. dr.menon@hospital.com"
            className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-ink3/50 focus:outline-none focus:border-teal-m/60 focus:ring-1 focus:ring-teal-m/60 transition"
          />
          {errors.email && (
            <p className="mt-1 text-[11px] text-red-300">{(errors.email as any).message}</p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink3 mb-2">Password</label>
          <input
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-ink3/50 focus:outline-none focus:border-teal-m/60 focus:ring-1 focus:ring-teal-m/60 transition"
          />
          {errors.password && (
            <p className="mt-1 text-[11px] text-red-300">{(errors.password as any).message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-bold text-sm gradient-teal hover:opacity-95 text-white rounded-xl py-3 shadow-lg shadow-teal-m/10 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Authorize Access'
          )}
        </button>
      </form>

      <div className="relative my-6 text-center">
        <hr className="border-white/5" />
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-ink2 px-3 text-[10px] text-ink3 uppercase font-mono tracking-wider">
          Or OAuth Link
        </span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full font-semibold text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 transition flex items-center justify-center gap-3 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign In with Google
      </button>

      <p className="mt-6 text-center text-[11px] text-ink3">
        New clinician?{' '}
        <Link href="/signup" className="text-teal-m hover:underline font-semibold">
          Create account
        </Link>
      </p>
    </div>
  )
}
