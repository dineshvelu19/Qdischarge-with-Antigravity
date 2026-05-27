'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { useAppStore, Patient, UserProfile } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const { user, loading: authLoading, logout } = useUser()
  const { patients, setPatients, user: storeUser } = useAppStore()
  const [dbLoading, setDbLoading] = useState(true)

  // Seed default data if database fails or is empty
  const defaultPatients: Patient[] = [
    { id: '1', name: 'Rajesh Kumar', age: 58, gender: 'M', ward: 'Ward 4B', bed: 'Bed 12', admission_diagnosis: 'Type 2 Diabetes Mellitus + STEMI (Treated)', status: 'discharge_in_progress' },
    { id: '2', name: 'Sunita Sharma', age: 45, gender: 'F', ward: 'Ward 2A', bed: 'Bed 05', admission_diagnosis: 'Acute Cholecystitis (Post-Cholecystectomy)', status: 'admitted' },
    { id: '3', name: 'Anil Deshmukh', age: 67, gender: 'M', ward: 'ICU 1', bed: 'Bed 03', admission_diagnosis: 'Chronic Heart Failure Exacerbation', status: 'admitted' },
    { id: '4', name: 'Meera Nair', age: 32, gender: 'F', ward: 'Ward 4B', bed: 'Bed 15', admission_diagnosis: 'Severe Pre-eclampsia (Post-Delivery)', status: 'admitted' }
  ]

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
        
        if (!error && data && data.length > 0) {
          setPatients(data as Patient[])
        } else {
          setPatients(defaultPatients)
        }
      } catch (err) {
        console.error('Error fetching patients from db:', err)
        setPatients(defaultPatients)
      } finally {
        setDbLoading(false)
      }
    }

    fetchPatients()
  }, [supabase, setPatients])

  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-teal-m border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-ink3 uppercase font-mono tracking-wider">Syncing Clinical Registry...</p>
        </div>
      </div>
    )
  }

  // Active user details helper
  const activeUser: UserProfile = storeUser || {
    id: 'mock',
    email: user?.email || 'dr.menon@hospital.com',
    full_name: user?.full_name || 'Dr. Sunita Menon',
    role: user?.role || 'physician'
  }

  const roleLabels: Record<string, string> = {
    physician: 'Physician',
    pharmacist: 'Clinical Pharmacist',
    nurse: 'Ward Nurse',
    billing: 'Billing Executive',
    care_coordinator: 'Care Coordinator',
    bed_manager: 'Bed Manager'
  }

  const handlePatientClick = (patientId: string) => {
    router.push(`/dashboard/patient/${patientId}`)
  }

  const dischargesInProgress = patients.filter((p) => p.status === 'discharge_in_progress').length
  const totalPatients = patients.length

  return (
    <div className="min-h-screen flex flex-col bg-ink text-foreground">
      
      {/* ── TOPBAR ── */}
      <header className="bg-ink2 border-b border-white/5 px-6 md:px-12 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <span className="font-serif text-base font-bold tracking-tight text-white">Qdischarge</span>
            <span className="text-[10px] text-ink3 ml-2 font-mono uppercase">Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-teal-l/15 text-teal-m border border-teal-m/25 px-2 py-0.5 rounded font-mono">
              NABH COP.9
            </span>
            <span className="text-[10px] bg-blue-l/15 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded font-mono">
              HL7 FHIR
            </span>
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* User profile & Switcher */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-white">{activeUser.full_name}</div>
              <div className="text-[9px] text-teal-m font-mono uppercase tracking-wider">
                {roleLabels[activeUser.role]}
              </div>
            </div>
            <button
              onClick={logout}
              className="text-[10px] bg-white/5 hover:bg-white/10 text-white rounded-lg px-2.5 py-1.5 transition cursor-pointer font-mono"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── WORKSPACE CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-8">
        
        {/* STATS OVERVIEW */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-5 border border-white/5">
            <div className="text-[10px] text-ink3 font-mono uppercase tracking-wider mb-1">Active Registry</div>
            <div className="font-serif text-3xl font-bold text-white">{totalPatients} Patients</div>
            <span className="text-[9px] text-ink3">Patients loaded in ward roster</span>
          </div>
          <div className="glass rounded-xl p-5 border border-white/5">
            <div className="text-[10px] text-ink3 font-mono uppercase tracking-wider mb-1">In Handoff Process</div>
            <div className="font-serif text-3xl font-bold text-teal-m">{dischargesInProgress} Cases</div>
            <span className="text-[9px] text-teal-m">Simultaneous multi-dept clearances</span>
          </div>
          <div className="glass rounded-xl p-5 border border-white/5">
            <div className="text-[10px] text-ink3 font-mono uppercase tracking-wider mb-1">Average discharge TAT</div>
            <div className="font-serif text-3xl font-bold text-blue-400">3.4 hrs</div>
            <span className="text-[9px] text-blue-400">Aligned with ABDM standard</span>
          </div>
          <div className="glass rounded-xl p-5 border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] text-ink3 font-mono uppercase tracking-wider mb-1">Performance Summary</div>
            <Link href="/dashboard/analytics" className="text-xs font-bold text-teal-m hover:underline flex items-center gap-1 font-mono">
              View TAT Analytics Dashboard →
            </Link>
          </div>
        </section>

        {/* PATIENTS TABLE LIST */}
        <section className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-serif text-lg text-white">Active Inpatient Roster</h2>
            <span className="text-[10px] text-ink3 font-mono uppercase tracking-wider">Ward 4B & Specialty units</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-6 py-4 text-[10px] text-ink3 uppercase font-mono tracking-wider">Patient Details</th>
                  <th className="px-6 py-4 text-[10px] text-ink3 uppercase font-mono tracking-wider">Demographics</th>
                  <th className="px-6 py-4 text-[10px] text-ink3 uppercase font-mono tracking-wider">Location</th>
                  <th className="px-6 py-4 text-[10px] text-ink3 uppercase font-mono tracking-wider">Primary Diagnosis</th>
                  <th className="px-6 py-4 text-[10px] text-ink3 uppercase font-mono tracking-wider">Workflow State</th>
                  <th className="px-6 py-4 text-[10px] text-ink3 uppercase font-mono tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-white/[0.01] transition">
                    <td className="px-6 py-5">
                      <div className="font-bold text-sm text-white">{patient.name}</div>
                      <div className="text-[10px] text-ink3 font-mono uppercase mt-0.5">ID: {patient.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-5 text-xs text-foreground/80">
                      {patient.age}Y · {patient.gender === 'M' ? 'Male' : 'Female'}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs text-white font-medium">{patient.ward}</div>
                      <div className="text-[10px] text-ink3">{patient.bed}</div>
                    </td>
                    <td className="px-6 py-5 text-xs text-foreground/75 max-w-xs truncate" title={patient.admission_diagnosis}>
                      {patient.admission_diagnosis}
                    </td>
                    <td className="px-6 py-5">
                      {patient.status === 'discharge_in_progress' ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] bg-teal-m/15 text-teal-m border border-teal-m/35 rounded-full px-3 py-1 font-semibold font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-m animate-pulse" />
                          IN PROGRESS
                        </span>
                      ) : patient.status === 'discharged' ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] bg-green-l/15 text-green-300 border border-green-500/25 rounded-full px-3 py-1 font-semibold font-mono">
                          ✓ DISCHARGED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] bg-white/5 text-ink3 border border-white/5 rounded-full px-3 py-1 font-mono">
                          CLINICAL CARE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {patient.status === 'discharge_in_progress' ? (
                        <button
                          onClick={() => handlePatientClick(patient.id)}
                          className="text-xs font-bold gradient-teal hover:opacity-90 text-white rounded-lg px-4 py-2 cursor-pointer transition shadow-md shadow-teal-m/10"
                        >
                          Manage Pathway
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePatientClick(patient.id)}
                          className="text-xs font-semibold bg-white/5 hover:bg-white/10 text-white rounded-lg px-4 py-2 cursor-pointer transition border border-white/10"
                        >
                          Initiate Discharge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-[10px] text-ink3/40 mt-12">
        Hospital Workflow Management Node · DynaRoster Live System Sync
      </footer>

    </div>
  )
}
