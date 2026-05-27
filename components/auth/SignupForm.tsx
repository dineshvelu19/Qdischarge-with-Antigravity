'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import Link from 'next/link'
import { ClinicalRole } from '@/lib/store'

const signupSchema = zod.object({
  fullName: zod.string().min(2, 'Please enter your full professional name'),
  role: zod.enum(['physician', 'pharmacist', 'nurse', 'billing', 'care_coordinator', 'bed_manager']),
  email: zod.string().email('Please enter a valid clinical email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters long'),
})

type SignupFormInputs = zod.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'physician',
    }
  })

  const onSubmit = async (data: SignupFormInputs) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        }
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess('Registration successful! Please check your clinical inbox for a confirmation link or proceed to sign in.')
      }
    } catch (err) {
      setError('An unexpected error occurred during registration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 rounded-2xl glass border border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl font-bold text-white mb-2">Create Clinical Account</h2>
        <p className="text-xs text-ink3">Register for the Qdischarge Platform</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-l/15 border border-red-500/30 text-xs text-red-300 leading-relaxed">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-l/15 border border-teal-m/35 text-xs text-teal-m leading-relaxed">
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink3 mb-2">Professional Full Name</label>
          <input
            type="text"
            {...register('fullName')}
            placeholder="e.g. Dr. Sunita Menon"
            className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-ink3/50 focus:outline-none focus:border-teal-m/60 focus:ring-1 focus:ring-teal-m/60 transition"
          />
          {errors.fullName && (
            <p className="mt-1 text-[11px] text-red-300">{(errors.fullName as any).message}</p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink3 mb-2">Clinical/Operational Role</label>
          <select
            {...register('role')}
            className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-m/60 focus:ring-1 focus:ring-teal-m/60 transition appearance-none cursor-pointer"
          >
            <option value="physician" className="bg-ink2 text-white">Physician (Admit & initiation)</option>
            <option value="pharmacist" className="bg-ink2 text-white">Clinical Pharmacist (Meds check)</option>
            <option value="nurse" className="bg-ink2 text-white">Ward Nurse (Education & Vitals)</option>
            <option value="billing" className="bg-ink2 text-white">Billing Executive (Claims & Invoicing)</option>
            <option value="care_coordinator" className="bg-ink2 text-white">Care Coordinator (Plan Referrals)</option>
            <option value="bed_manager" className="bg-ink2 text-white">Bed Manager (Housekeeping Turnover)</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-[11px] text-red-300">{(errors.role as any).message}</p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink3 mb-2">Clinical Email</label>
          <input
            type="email"
            {...register('email')}
            placeholder="e.g. s.menon@hospital.com"
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
            placeholder="Min 6 characters"
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
            'Register Credentials'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[11px] text-ink3">
        Already registered?{' '}
        <Link href="/login" className="text-teal-m hover:underline font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  )
}
