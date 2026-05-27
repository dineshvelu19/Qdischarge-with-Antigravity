'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { useAppStore, Patient, DischargeCase, DepartmentTask, UserProfile } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PatientWorkflowPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const patientId = resolvedParams.id
  const supabase = createClient()
  const { user: authUser } = useUser()
  
  // Zustand State
  const { 
    patients, 
    discharges, 
    tasks, 
    user: storeUser,
    updatePatientStatus, 
    upsertDischarge,
    updateTaskStatus
  } = useAppStore()

  // Local component states
  const [patient, setPatient] = useState<Patient | null>(null)
  const [activePhase, setActivePhase] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [pinConfirmOpen, setPinConfirmOpen] = useState(false)
  const [pinCode, setPinCode] = useState('')
  const [pinError, setPinError] = useState('')
  const [auditLogsList, setAuditLogsList] = useState<any[]>([])

  // Phase 1 form states
  const [disposition, setDisposition] = useState('Home')
  const [transportMode, setTransportMode] = useState('Private Vehicle')
  const [edtHours, setEdtHours] = useState(4)
  const [clinicalChecklist, setClinicalChecklist] = useState({
    hemodynamicStable: false,
    primaryDiagnosisControlled: false,
    toleratingOral: false,
    safeEnvironment: false,
    noteCompleted: false
  })

  // Phase 2 editing states
  const [draftComplaint, setDraftComplaint] = useState('')
  const [draftCourse, setDraftCourse] = useState('')
  const [draftFollowUp, setDraftFollowUp] = useState('')
  const [draftCondition, setDraftCondition] = useState('')
  const [icdCodes, setIcdCodes] = useState([
    { code: 'E11.9', desc: 'Type 2 Diabetes Mellitus without complications', accepted: true },
    { code: 'I21.3', desc: 'ST elevation myocardial infarction (STEMI) of anterior wall', accepted: true }
  ])

  // Phase 5 WhatsApp loading state
  const [notifSent, setNotifSent] = useState(false)

  // Active User Profile
  const activeUser: UserProfile = storeUser || {
    id: 'mock',
    email: authUser?.email || 'dr.menon@hospital.com',
    full_name: authUser?.full_name || 'Dr. Sunita Menon',
    role: authUser?.role || 'physician'
  }

  // Load Patient and Discharge Case
  useEffect(() => {
    const foundPatient = patients.find((p) => p.id === patientId)
    if (foundPatient) {
      setPatient(foundPatient)
      
      // Initialize active case
      const activeCase = discharges[patientId]
      if (activeCase) {
        setDisposition(activeCase.disposition || 'Home')
        setTransportMode(activeCase.transport_mode || 'Private Vehicle')
        setClinicalChecklist({
          hemodynamicStable: !!activeCase.clinical_readiness.hemodynamicStable,
          primaryDiagnosisControlled: !!activeCase.clinical_readiness.primaryDiagnosisControlled,
          toleratingOral: !!activeCase.clinical_readiness.toleratingOral,
          safeEnvironment: !!activeCase.clinical_readiness.safeEnvironment,
          noteCompleted: !!activeCase.clinical_readiness.noteCompleted,
        })
        setDraftComplaint(activeCase.summary_draft?.chiefComplaint || '')
        setDraftCourse(activeCase.summary_draft?.hospitalCourse || '')
        setDraftFollowUp(activeCase.summary_draft?.followUp || '')
        setDraftCondition(activeCase.summary_draft?.condition || '')
        
        // Determine starting phase based on status
        if (activeCase.status === 'signed') setActivePhase(3)
        else if (activeCase.status === 'cleared') setActivePhase(4)
        else if (activeCase.status === 'completed') setActivePhase(5)
        else setActivePhase(2)
      } else {
        // Fallback or Initialise
        if (foundPatient.status === 'discharge_in_progress') {
          // Pre-populate mock active case
          const mockCase: DischargeCase = {
            id: `d-${patientId}`,
            patient_id: patientId,
            physician_id: activeUser.id,
            edt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            transport_mode: 'Private Vehicle',
            disposition: 'Home',
            status: 'initiated',
            clinical_readiness: {
              hemodynamicStable: true,
              primaryDiagnosisControlled: true,
              toleratingOral: true,
              safeEnvironment: true,
              noteCompleted: true
            },
            summary_draft: {
              chiefComplaint: 'Chest pain radiating to left arm accompanied by diaphoresis and shortness of breath.',
              hospitalCourse: '58-year-old male admitted with anterior wall STEMI. Emergency angiography showed 95% occlusion in LAD. Successful primary angioplasty with DES placed in LAD. Post-procedure clinical course uneventful. Blood glucose managed with sliding-scale insulin, stabilized on oral agents. Patient counselled on target glycemic zones and acute cardiac symptoms.',
              followUp: 'Cardiology Clinic outpatient review in 7 days for clinical evaluation and ECG. Endocrinology review in 2 weeks for T2DM medication review. Home glucose checks three times daily.',
              condition: 'Hemodynamically stable, ambulating independently, tolerating standard diabetic diet.',
              medications: [
                { name: 'Tab Clopidogrel 75mg', dosage: '1-0-0', frequency: 'Once Daily', duration: '1 Year', type: 'modified' },
                { name: 'Tab Atorvastatin 40mg', dosage: '0-0-1', frequency: 'Once Nightly', duration: 'Lifelong', type: 'modified' },
                { name: 'Tab Metformin 500mg', dosage: '1-0-1', frequency: 'Twice Daily', duration: 'Review 2w', type: 'admission' },
                { name: 'Tab Ramipril 2.5mg', dosage: '1-0-0', frequency: 'Once Daily', duration: 'Review 1m', type: 'modified' }
              ]
            },
            signed_at: null,
            signed_by: null
          }
          upsertDischarge(mockCase)
          
          setClinicalChecklist({
            hemodynamicStable: !!mockCase.clinical_readiness.hemodynamicStable,
            primaryDiagnosisControlled: !!mockCase.clinical_readiness.primaryDiagnosisControlled,
            toleratingOral: !!mockCase.clinical_readiness.toleratingOral,
            safeEnvironment: !!mockCase.clinical_readiness.safeEnvironment,
            noteCompleted: !!mockCase.clinical_readiness.noteCompleted,
          })
          setDraftComplaint(mockCase.summary_draft.chiefComplaint || '')
          setDraftCourse(mockCase.summary_draft.hospitalCourse || '')
          setDraftFollowUp(mockCase.summary_draft.followUp || '')
          setDraftCondition(mockCase.summary_draft.condition || '')
          setActivePhase(2)

          // Initialise Mock Department Tasks
          if (!tasks[mockCase.id]) {
            const defaultTasks: DepartmentTask[] = [
              { id: `t-ph-${patientId}`, discharge_id: mockCase.id, department: 'pharmacy', status: 'in_progress', task_data: { note: 'Preparing Rx Pack' }, completed_at: null },
              { id: `t-nu-${patientId}`, discharge_id: mockCase.id, department: 'nursing', status: 'in_progress', task_data: { note: 'Final vitals checked' }, completed_at: null },
              { id: `t-bi-${patientId}`, discharge_id: mockCase.id, department: 'billing', status: 'pending', task_data: { note: 'Claims verification' }, completed_at: null },
              { id: `t-cc-${patientId}`, discharge_id: mockCase.id, department: 'care_coordination', status: 'pending', task_data: { note: 'Referrals booked' }, completed_at: null },
              { id: `t-bm-${patientId}`, discharge_id: mockCase.id, department: 'bed_management', status: 'completed', task_data: { note: 'Housekeeping Turnover Cleared' }, completed_at: new Date().toISOString() }
            ]
            useAppStore.setState((state) => ({
              tasks: { ...state.tasks, [mockCase.id]: defaultTasks }
            }))
          }
        }
      }
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }, [patientId, patients, discharges, activeUser.id, upsertDischarge, tasks, router])

  // Initialize Audit Logs
  useEffect(() => {
    if (patient) {
      setAuditLogsList([
        { action: 'Discharge Order Created', detail: 'EDT logged as default +4h from bedside initiation.', user: activeUser.full_name, role: activeUser.role, time: '17:02:24' },
        { action: 'EHR Data Pull Success', detail: 'FHIR R4 resources imported successfully representing vitals, medication lists, and angiogram records.', user: 'System Bot', role: 'system', time: '17:03:02' }
      ])
    }
  }, [patient, activeUser.full_name, activeUser.role])

  if (loading || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <span className="w-10 h-10 border-4 border-teal-m border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const activeCase = discharges[patientId]
  const currentTasks = activeCase ? tasks[activeCase.id] || [] : []

  // Step 1: Bedside Initiation Click
  const handleInitiateDischarge = () => {
    const mockCase: DischargeCase = {
      id: `d-${patientId}`,
      patient_id: patientId,
      physician_id: activeUser.id,
      edt: new Date(Date.now() + edtHours * 60 * 60 * 1000).toISOString(),
      transport_mode: transportMode,
      disposition: disposition,
      status: 'initiated',
      clinical_readiness: clinicalChecklist,
      summary_draft: {
        chiefComplaint: 'Chest pain radiating to left arm accompanied by diaphoresis and shortness of breath.',
        hospitalCourse: '58-year-old male admitted with anterior wall STEMI. Emergency angiography showed 95% occlusion in LAD. Successful primary angioplasty with DES placed in LAD. Post-procedure clinical course uneventful. Blood glucose managed with sliding-scale insulin, stabilized on oral agents. Patient counselled on target glycemic zones and acute cardiac symptoms.',
        followUp: 'Cardiology Clinic outpatient review in 7 days for clinical evaluation and ECG. Endocrinology review in 2 weeks for T2DM medication review. Home glucose checks three times daily.',
        condition: 'Hemodynamically stable, ambulating independently, tolerating standard diabetic diet.',
        medications: [
          { name: 'Tab Clopidogrel 75mg', dosage: '1-0-0', frequency: 'Once Daily', duration: '1 Year', type: 'modified' },
          { name: 'Tab Atorvastatin 40mg', dosage: '0-0-1', frequency: 'Once Nightly', duration: 'Lifelong', type: 'modified' },
          { name: 'Tab Metformin 500mg', dosage: '1-0-1', frequency: 'Twice Daily', duration: 'Review 2w', type: 'admission' },
          { name: 'Tab Ramipril 2.5mg', dosage: '1-0-0', frequency: 'Once Daily', duration: 'Review 1m', type: 'modified' }
        ]
      },
      signed_at: null,
      signed_by: null
    }

    upsertDischarge(mockCase)
    updatePatientStatus(patientId, 'discharge_in_progress')

    // Initialise Tasks
    const defaultTasks: DepartmentTask[] = [
      { id: `t-ph-${patientId}`, discharge_id: mockCase.id, department: 'pharmacy', status: 'in_progress', task_data: { note: 'Preparing Rx Pack' }, completed_at: null },
      { id: `t-nu-${patientId}`, discharge_id: mockCase.id, department: 'nursing', status: 'in_progress', task_data: { note: 'Final vitals checked' }, completed_at: null },
      { id: `t-bi-${patientId}`, discharge_id: mockCase.id, department: 'billing', status: 'pending', task_data: { note: 'Claims verification' }, completed_at: null },
      { id: `t-cc-${patientId}`, discharge_id: mockCase.id, department: 'care_coordination', status: 'pending', task_data: { note: 'Referrals booked' }, completed_at: null },
      { id: `t-bm-${patientId}`, discharge_id: mockCase.id, department: 'bed_management', status: 'completed', task_data: { note: 'Housekeeping Turnover Cleared' }, completed_at: new Date().toISOString() }
    ]
    useAppStore.setState((state) => ({
      tasks: { ...state.tasks, [mockCase.id]: defaultTasks }
    }))

    // Add Audit Log
    setAuditLogsList((prev) => [
      ...prev,
      { action: 'Discharge Order Created', detail: `Formal order logged. EDT set to ${edtHours} hours. Transport: ${transportMode}`, user: activeUser.full_name, role: activeUser.role, time: new Date().toTimeString().split(' ')[0] }
    ])

    setActivePhase(2)
  }

  // Step 2: Digital Sign-off Confirmation
  const handlePinSubmit = () => {
    if (pinCode === '1234') {
      setPinError('')
      setPinConfirmOpen(false)
      
      if (activeCase) {
        const signedCase: DischargeCase = {
          ...activeCase,
          status: 'signed',
          signed_at: new Date().toISOString(),
          signed_by: activeUser.id,
          summary_draft: {
            ...activeCase.summary_draft,
            chiefComplaint: draftComplaint,
            hospitalCourse: draftCourse,
            followUp: draftFollowUp,
            condition: draftCondition
          }
        }
        upsertDischarge(signedCase)

        // Add Audit Log
        setAuditLogsList((prev) => [
          ...prev,
          { action: 'Digital Signature Applied', detail: 'Discharge summary signed with biometric PIN override. Document status locked.', user: activeUser.full_name, role: activeUser.role, time: new Date().toTimeString().split(' ')[0] }
        ])

        setActivePhase(3)
      }
    } else {
      setPinError('Incorrect authorization PIN code. Please try again.')
    }
  }

  // Step 3: Simulated Clearances
  const handleSimulateClearance = () => {
    if (activeCase) {
      updateTaskStatus(activeCase.id, 'pharmacy', 'completed', { note: 'Meds Pack Dispatched' })
      updateTaskStatus(activeCase.id, 'nursing', 'completed', { note: 'IV Removed, Education Finished' })
      updateTaskStatus(activeCase.id, 'billing', 'completed', { note: 'Claim Settled, Bill Generated' })
      updateTaskStatus(activeCase.id, 'care_coordination', 'completed', { note: 'Clinic Slots Pre-booked' })

      // Clear case status
      const clearedCase: DischargeCase = {
        ...activeCase,
        status: 'cleared'
      }
      upsertDischarge(clearedCase)

      // Add Audit Log
      setAuditLogsList((prev) => [
        ...prev,
        { action: 'Multi-Dept Clearances Finished', detail: 'Real-time sync complete. Pharmacy, Nursing, Billing, and Care Plan marked CLEARED.', user: 'System Bot', role: 'system', time: new Date().toTimeString().split(' ')[0] }
      ])

      setActivePhase(4)
    }
  }

  // Step 4: Compliance Audits Complete
  const handleFinalizeCompliance = () => {
    if (activeCase) {
      const completedCase: DischargeCase = {
        ...activeCase,
        status: 'completed'
      }
      upsertDischarge(completedCase)
      updatePatientStatus(patientId, 'discharged')

      // Add Audit Log
      setAuditLogsList((prev) => [
        ...prev,
        { action: 'Discharge Finalized', detail: 'NABH audit trail saved to immutable cloud. Case completed.', user: activeUser.full_name, role: activeUser.role, time: new Date().toTimeString().split(' ')[0] }
      ])

      setActivePhase(5)
    }
  }

  // Step 5: WhatsApp mock send
  const handleSendNotification = () => {
    setNotifSent(true)
    setTimeout(() => {
      setNotifSent(false)
      alert('Notification dispatched successfully via WhatsApp + SMS!')
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink text-foreground">
      
      {/* ── TOPBAR ── */}
      <header className="bg-ink2 border-b border-white/5 px-6 md:px-12 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-ink3 hover:text-white transition flex items-center gap-1.5 text-xs font-mono">
            ← Registry
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">{patient.name}</span>
            <span className="text-[10px] text-ink3">/ Bedside Coordinator</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] bg-teal-l/15 text-teal-m border border-teal-m/25 px-2.5 py-0.5 rounded font-mono">
            Ward 4B · Bed 12
          </span>
          <span className="text-[10px] bg-white/5 text-ink3 border border-white/5 px-2.5 py-0.5 rounded font-mono uppercase">
            Physician Active view
          </span>
        </div>
      </header>

      {/* ── SHELL CONTAINER ── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] h-[calc(100vh-64px)] overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="bg-ink2 border-r border-white/5 flex flex-col justify-between overflow-y-auto">
          
          <div className="p-4 space-y-6">
            
            {/* Patient Overview */}
            <div className="bg-white/2 border border-white/5 rounded-xl p-4">
              <h3 className="text-xs font-bold text-white mb-2">{patient.name}</h3>
              <div className="text-[10px] text-ink3 space-y-1 font-sans">
                <div>Age / Gender: <span className="text-white">{patient.age}Y · {patient.gender}</span></div>
                <div>Diagnosis: <span className="text-white line-clamp-1">{patient.admission_diagnosis}</span></div>
                <div>Roster Status: {patient.status === 'discharge_in_progress' ? (
                  <span className="text-teal-m font-semibold font-mono">IN PROGRESS</span>
                ) : patient.status === 'discharged' ? (
                  <span className="text-green-300 font-semibold font-mono">DISCHARGED</span>
                ) : (
                  <span className="text-ink3 font-mono">CLINICAL CARE</span>
                )}</div>
              </div>
            </div>

            {/* Phase Selector buttons */}
            <div className="space-y-1">
              <span className="block text-[9px] font-mono text-ink3 uppercase tracking-wider mb-2 px-2">Discharge Pathway</span>
              
              {[
                { n: 1, title: 'Discharge Initiation', time: '3-5 min' },
                { n: 2, title: 'AI Summary Editor', time: '5-8 min' },
                { n: 3, title: 'Coordination monitor', time: 'Real-time' },
                { n: 4, title: 'Compliance & Locks', time: 'Automated' },
                { n: 5, title: 'Patient Notification', time: 'Instant' },
                { n: 6, title: 'Throughput Analytics', time: 'Dashboard' }
              ].map((p) => {
                const isLocked = !activeCase && p.n > 1
                return (
                  <button
                    key={p.n}
                    disabled={isLocked}
                    onClick={() => setActivePhase(p.n)}
                    className={`w-full flex items-center justify-between text-left p-3 rounded-lg border transition font-sans cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                      activePhase === p.n
                        ? 'bg-teal-m/15 border-teal-m/40 text-white font-semibold'
                        : 'bg-transparent border-transparent text-ink3 hover:bg-white/2'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{p.title}</div>
                      <div className="text-[9px] text-ink3 font-mono">{p.time}</div>
                    </div>
                    {activeCase && p.n < activePhase && <span className="text-teal-m text-xs">✓</span>}
                  </button>
                )
              })}
            </div>

          </div>

          <div className="p-4 border-t border-white/5 text-[9px] text-ink3/50 leading-relaxed font-sans">
            Clinician Portal Core v2.0 <br />
            NABH Standard Compliant Node
          </div>

        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="overflow-y-auto p-6 md:p-10 bg-gradient-to-b from-ink via-ink/50 to-ink">
          
          {/* PHASE 1: DISCHARGE INITIATION */}
          {activePhase === 1 && (
            <div className="max-w-4xl space-y-6 animate-[fadeUp_0.3s_ease]">
              
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono text-teal-m uppercase tracking-wider block mb-1">Phase 01 of 06</span>
                  <h2 className="font-serif text-2xl text-white mb-2">Discharge Decision & Bedside Order</h2>
                  <p className="text-xs text-ink3 leading-relaxed max-w-xl">
                    Initiate formal patient handoff, set estimated turnaround limits, and dispatch instant real-time alerts to downstream units.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif text-teal-m font-semibold">3–5</span>
                  <div className="text-[9px] text-ink3 font-mono uppercase">Physician Min</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Checklist */}
                <div className="glass rounded-xl p-6 border border-white/5 space-y-5">
                  <h3 className="font-serif text-sm text-white border-b border-white/5 pb-2">Clinical Benchmarks</h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'hemodynamicStable', title: 'Hemodynamic Stability Confirmed', desc: 'Blood pressure, heart rate, and oxygen levels stable for ≥12h' },
                      { key: 'primaryDiagnosisControlled', title: 'Primary Diagnosis Resolved/Controlled', desc: 'STEMI therapy successfully managed, post-op symptoms controlled' },
                      { key: 'toleratingOral', title: 'Oral Intake Tolerated', desc: 'Patient is transitioning smoothly off IV meds' },
                      { key: 'safeEnvironment', title: 'Caregiver Support Checked', desc: 'Home safety audit and post-discharge help verified' },
                      { key: 'noteCompleted', title: 'Bedside note loaded to EHR', desc: 'Initial progress logs synced' }
                    ].map((item) => (
                      <label key={item.key} className="flex gap-3 items-start cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={(clinicalChecklist as any)[item.key]}
                          onChange={(e) => setClinicalChecklist({ ...clinicalChecklist, [item.key]: e.target.checked })}
                          className="mt-1 accent-teal-m rounded w-4 h-4"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white">{item.title}</div>
                          <div className="text-[10px] text-ink3 mt-0.5 leading-relaxed">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form fields */}
                <div className="glass rounded-xl p-6 border border-white/5 space-y-5">
                  <h3 className="font-serif text-sm text-white border-b border-white/5 pb-2">Handoff Instructions</h3>
                  
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-ink3 mb-2">Disposition Pathway</label>
                      <select
                        value={disposition}
                        onChange={(e) => setDisposition(e.target.value)}
                        className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-teal-m"
                      >
                        <option value="Home">Discharge to Home</option>
                        <option value="Rehabilitation">Transfer to Rehabilitation Unit</option>
                        <option value="Other Hospital">Transfer to tertiary care center</option>
                        <option value="LAMA">Discharge against medical advice</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-ink3 mb-2">Estimated Turnaround Limit (EDT)</label>
                      <select
                        value={edtHours}
                        onChange={(e) => setEdtHours(Number(e.target.value))}
                        className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-teal-m"
                      >
                        <option value={2}>2 Hours (Urgent)</option>
                        <option value={4}>4 Hours (Standard hospital default)</option>
                        <option value={6}>6 Hours (Extended cases)</option>
                        <option value={8}>8 Hours (Slow release)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-ink3 mb-2">Handover Transport Mode</label>
                      <select
                        value={transportMode}
                        onChange={(e) => setTransportMode(e.target.value)}
                        className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-teal-m"
                      >
                        <option value="Private Vehicle">Private Vehicle</option>
                        <option value="Ambulance">Advanced Cardiac Life Support Ambulance</option>
                        <option value="Walkout">Walkout unaccompanied</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleInitiateDischarge}
                  className="font-bold text-sm gradient-teal hover:opacity-95 text-white rounded-xl px-8 py-3.5 shadow-lg shadow-teal-m/20 transition flex items-center gap-2 cursor-pointer"
                >
                  Confirm Bedside Order & Dispatch →
                </button>
              </div>

            </div>
          )}

          {/* PHASE 2: AI SUMMARY EDITOR */}
          {activePhase === 2 && (
            <div className="max-w-4xl space-y-6 animate-[fadeUp_0.3s_ease]">
              
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono text-teal-m uppercase tracking-wider block mb-1">Phase 02 of 06</span>
                  <h2 className="font-serif text-2xl text-white mb-2">AI-Assisted Summary Review & Edit</h2>
                  <p className="text-xs text-ink3 leading-relaxed max-w-xl">
                    Review and override clinical sections auto-compiled from the EHR system. Verify medications and apply electronic signature.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif text-teal-m font-semibold">5–8</span>
                  <div className="text-[9px] text-ink3 font-mono uppercase">Physician Min</div>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Forms Editor */}
                <div className="md:col-span-2 space-y-4 text-left">
                  
                  <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-teal-m">Chief Complaint</h3>
                    <textarea
                      value={draftComplaint}
                      onChange={(e) => setDraftComplaint(e.target.value)}
                      rows={2}
                      className="w-full bg-ink/30 border border-white/5 rounded-lg p-3 text-xs text-foreground/80 focus:outline-none focus:border-teal-m/60"
                    />
                  </div>

                  <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-teal-m">Hospital Course</h3>
                    <textarea
                      value={draftCourse}
                      onChange={(e) => setDraftCourse(e.target.value)}
                      rows={6}
                      className="w-full bg-ink/30 border border-white/5 rounded-lg p-3 text-xs text-foreground/80 leading-relaxed focus:outline-none focus:border-teal-m/60"
                    />
                  </div>

                  <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-teal-m">Follow-up Instructions</h3>
                    <textarea
                      value={draftFollowUp}
                      onChange={(e) => setDraftFollowUp(e.target.value)}
                      rows={3}
                      className="w-full bg-ink/30 border border-white/5 rounded-lg p-3 text-xs text-foreground/80 leading-relaxed focus:outline-none focus:border-teal-m/60"
                    />
                  </div>

                  <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-teal-m">Condition at Discharge</h3>
                    <input
                      type="text"
                      value={draftCondition}
                      onChange={(e) => setDraftCondition(e.target.value)}
                      className="w-full bg-ink/30 border border-white/5 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-teal-m/60"
                    />
                  </div>

                </div>

                {/* Right sidebars: ICD coding, Med Reconciliation preview */}
                <div className="space-y-4 text-left">
                  
                  {/* ICD-10 suggestions */}
                  <div className="glass rounded-xl p-5 border border-white/5 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-teal-m">ICD-10 Suggestions</h3>
                    <div className="space-y-2">
                      {icdCodes.map((item, idx) => (
                        <div key={item.code} className="p-3 bg-white/2 border border-white/5 rounded-lg flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={item.accepted}
                            onChange={(e) => {
                              const updated = [...icdCodes]
                              updated[idx].accepted = e.target.checked
                              setIcdCodes(updated)
                            }}
                            className="mt-1 accent-teal-m"
                          />
                          <div>
                            <div className="text-xs font-bold text-white">{item.code}</div>
                            <div className="text-[10px] text-ink3 mt-0.5 leading-relaxed">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Med reconciliation preview */}
                  <div className="glass rounded-xl p-5 border border-white/5 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-teal-m">Medication Changes</h3>
                    <div className="space-y-2 text-[10px] font-sans">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-ink3">Active Rx</span>
                        <span className="text-teal-m">Status</span>
                      </div>
                      <div className="p-2 bg-teal-m/5 rounded flex justify-between">
                        <span>Tab Clopidogrel 75mg</span>
                        <span className="text-teal-m font-semibold">Modified</span>
                      </div>
                      <div className="p-2 bg-teal-m/5 rounded flex justify-between">
                        <span>Tab Atorvastatin 40mg</span>
                        <span className="text-teal-m font-semibold">Modified</span>
                      </div>
                      <div className="p-2 bg-white/2 rounded flex justify-between text-ink3">
                        <span>Tab Metformin 500mg</span>
                        <span>Unchanged</span>
                      </div>
                    </div>
                  </div>

                  {/* Digital signatures locks gate */}
                  <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-red-300">Sign-off Gate</h3>
                    <div className="text-[10px] text-ink3 leading-relaxed">
                      NABH Standard requires absolute completeness. Tapping below will lock the electronic case summary under your legal credentials.
                    </div>
                    <button
                      onClick={() => setPinConfirmOpen(true)}
                      className="w-full text-center font-bold text-xs gradient-teal hover:opacity-90 text-white rounded-xl py-3 cursor-pointer transition shadow-md shadow-teal-m/10"
                    >
                      🖋 Apply digital signature
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* PHASE 3: COORDINATION MONITOR */}
          {activePhase === 3 && (
            <div className="max-w-4xl space-y-6 animate-[fadeUp_0.3s_ease]">
              
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono text-teal-m uppercase tracking-wider block mb-1">Phase 03 of 06</span>
                  <h2 className="font-serif text-2xl text-white mb-2">Unified Coordination & clearances Dashboard</h2>
                  <p className="text-xs text-ink3 leading-relaxed max-w-xl">
                    Supervise simultaneous clearance tasks across departments. The system routes all logs automatically. Override manually to simulate complete clearance.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif text-teal-m font-semibold">1–2</span>
                  <div className="text-[9px] text-ink3 font-mono uppercase">Monitoring Min</div>
                </div>
              </div>

              {/* Real-time cleared list */}
              <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
                <h3 className="font-serif text-sm text-white text-left">Clearance Progress Log</h3>
                
                <div className="divide-y divide-white/5 text-left">
                  {currentTasks.map((t) => (
                    <div key={t.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {t.department === 'pharmacy' ? '💊' : 
                           t.department === 'nursing' ? '🏥' : 
                           t.department === 'billing' ? '💳' : 
                           t.department === 'care_coordination' ? '🤝' : '🛏'}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white capitalize">{t.department.replace('_', ' ')}</div>
                          <div className="text-[10px] text-ink3 mt-0.5">{t.task_data?.note || 'Pending database handshake'}</div>
                        </div>
                      </div>
                      
                      <div>
                        {t.status === 'completed' ? (
                          <span className="text-[10px] bg-green-l/15 text-green-300 border border-green-500/25 px-2.5 py-1 rounded font-mono font-semibold">
                            ✓ CLEARED
                          </span>
                        ) : t.status === 'in_progress' ? (
                          <span className="text-[10px] bg-amber-l/15 text-yellow-300 border border-yellow-500/25 px-2.5 py-1 rounded font-mono font-semibold animate-pulse">
                            IN PROGRESS
                          </span>
                        ) : (
                          <span className="text-[10px] bg-white/5 text-ink3 border border-white/5 px-2.5 py-1 rounded font-mono">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4 justify-end">
                  <button
                    onClick={handleSimulateClearance}
                    className="font-bold text-xs bg-teal-d hover:bg-teal-m text-white rounded-xl px-5 py-3 transition cursor-pointer"
                  >
                    ⚡ Simulate Clearances (Bypass department delays)
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* PHASE 4: COMPLIANCE LEDGER */}
          {activePhase === 4 && (
            <div className="max-w-4xl space-y-6 animate-[fadeUp_0.3s_ease]">
              
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono text-teal-m uppercase tracking-wider block mb-1">Phase 04 of 06</span>
                  <h2 className="font-serif text-2xl text-white mb-2">Immutable Compliance Ledger & Logs</h2>
                  <p className="text-xs text-ink3 leading-relaxed max-w-xl">
                    Every operational override and electronic signature is logged immutably matching the Indian Evidence Act rules.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif text-teal-m font-semibold">0</span>
                  <div className="text-[9px] text-ink3 font-mono uppercase">Min Overhead</div>
                </div>
              </div>

              {/* Audit trail ledger */}
              <div className="glass rounded-xl border border-white/5 p-6 text-left">
                <h3 className="font-serif text-sm text-white mb-4">Append-Only Audit Ledger</h3>

                <div className="relative border-l border-white/5 pl-5 space-y-6 font-sans">
                  {auditLogsList.map((log, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[26px] top-0.5 w-3 h-3 rounded-full bg-teal-m border-2 border-ink" />
                      <div className="text-xs font-bold text-white flex items-center justify-between gap-2">
                        <span>{log.action}</span>
                        <span className="text-[9px] text-ink3 font-mono">{log.time}</span>
                      </div>
                      <div className="text-[10px] text-ink3 mt-1 leading-relaxed">{log.detail}</div>
                      <div className="text-[9px] text-teal-m/80 mt-1 font-mono uppercase">Logged: {log.user} ({log.role})</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                  <button
                    onClick={handleFinalizeCompliance}
                    className="font-bold text-xs gradient-teal hover:opacity-95 text-white rounded-xl px-6 py-3 shadow-lg shadow-teal-m/10 transition cursor-pointer"
                  >
                    Finalize & Lock Complete Audit Trail →
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* PHASE 5: PATIENT NOTIFICATION */}
          {activePhase === 5 && (
            <div className="max-w-4xl space-y-6 animate-[fadeUp_0.3s_ease]">
              
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono text-teal-m uppercase tracking-wider block mb-1">Phase 05 of 06</span>
                  <h2 className="font-serif text-2xl text-white mb-2">Patient Handoff Notification</h2>
                  <p className="text-xs text-ink3 leading-relaxed max-w-xl">
                    Dispatch prescription schedules, follow-up timelines, and clinical notes directly to the secure patient portal and chat channels.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif text-teal-m font-semibold">1</span>
                  <div className="text-[9px] text-ink3 font-mono uppercase">Physician Min</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Send triggers */}
                <div className="glass rounded-xl p-5 border border-white/5 space-y-4 text-left">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-teal-m">Dispatch center</h3>
                  <div className="text-[10px] text-ink3 leading-relaxed">
                    Automated systems will deliver encrypted medical summaries matching local languages.
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={handleSendNotification}
                      className="w-full flex items-center justify-center gap-2 font-bold text-xs bg-[#25D366] text-white rounded-xl py-3 hover:opacity-95 transition cursor-pointer"
                    >
                      💬 Send WhatsApp Alert
                    </button>
                    <button
                      onClick={() => alert('Encrypted summary dispatched to secure hospital portal!')}
                      className="w-full flex items-center justify-center gap-2 font-bold text-xs bg-white/5 hover:bg-white/10 text-white rounded-xl py-3 transition cursor-pointer border border-white/10"
                    >
                      🔐 Secure Portal Sync
                    </button>
                  </div>
                </div>

                {/* Print layout preview */}
                <div className="md:col-span-2 glass rounded-xl p-6 border border-white/5 text-left font-sans space-y-4 bg-white/1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">Qdischarge Medical Handout</div>
                        <div className="text-[9px] text-ink3 font-mono">DynaSlip-122415</div>
                      </div>
                      <span className="text-[9px] font-mono bg-teal-l/15 text-teal-m border border-teal-m/20 px-2 py-0.5 rounded">
                        SIGNED ELECTRONICALLY
                      </span>
                    </div>

                    <div className="space-y-3 mt-4 text-[10px] leading-relaxed">
                      <div>
                        <span className="text-ink3 uppercase font-mono block text-[9px]">Chief Complaint</span>
                        <p className="text-white">{draftComplaint || 'Chest pain anterior wall.'}</p>
                      </div>
                      <div>
                        <span className="text-ink3 uppercase font-mono block text-[9px]">Discharge Medications</span>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div className="bg-white/2 p-1.5 rounded">Tab Clopidogrel 75mg (1-0-0)</div>
                          <div className="bg-white/2 p-1.5 rounded">Tab Atorvastatin 40mg (0-0-1)</div>
                        </div>
                      </div>
                      <div>
                        <span className="text-ink3 uppercase font-mono block text-[9px]">Follow-up plan</span>
                        <p className="text-white">{draftFollowUp || 'Outpatient review in 7 days.'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => window.print()}
                      className="font-bold text-xs bg-white text-ink hover:opacity-90 rounded-xl px-4 py-2.5 transition cursor-pointer"
                    >
                      🖨 Print DynaSlip Handout
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* PHASE 6: THROUGHPUT ANALYTICS */}
          {activePhase === 6 && (
            <div className="max-w-4xl space-y-6 animate-[fadeUp_0.3s_ease]">
              
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono text-teal-m uppercase tracking-wider block mb-1">Phase 06 of 06</span>
                  <h2 className="font-serif text-2xl text-white mb-2">Throughput Analytics & Metrics</h2>
                  <p className="text-xs text-ink3 leading-relaxed max-w-xl">
                    Analyze average case turnaround times (TAT), department release patterns, and compile JCI documentation reports.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif text-teal-m font-semibold">Weekly</span>
                  <div className="text-[9px] text-ink3 font-mono uppercase">10 min summary</div>
                </div>
              </div>

              {/* Mock charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Metric overview */}
                <div className="glass rounded-xl p-5 border border-white/5 text-center space-y-2">
                  <span className="text-3xl font-serif text-teal-m font-semibold">92%</span>
                  <div className="text-[10px] text-ink3 font-mono uppercase">EDT Match accuracy</div>
                  <p className="text-[9px] text-ink3/75 leading-relaxed">Discharges cleared within 30 min of physician-entered EDT</p>
                </div>
                <div className="glass rounded-xl p-5 border border-white/5 text-center space-y-2">
                  <span className="text-3xl font-serif text-blue-400 font-semibold">2.4 hrs</span>
                  <div className="text-[10px] text-ink3 font-mono uppercase">Avg. Pharmacy Pack TAT</div>
                  <p className="text-[9px] text-ink3/75 leading-relaxed">Median timeframe from bedside trigger to pharmacy delivery</p>
                </div>
                <div className="glass rounded-xl p-5 border border-white/5 text-center space-y-2">
                  <span className="text-3xl font-serif text-purple-400 font-semibold">-45 min</span>
                  <div className="text-[10px] text-ink3 font-mono uppercase">Claim settlement savings</div>
                  <p className="text-[9px] text-ink3/75 leading-relaxed">Average billing speed improvements via direct ABDM/NHCX schemas</p>
                </div>

              </div>

              {/* Heatmap mock */}
              <div className="glass rounded-2xl border border-white/5 p-6 text-left">
                <h3 className="font-serif text-sm text-white mb-4">Department Handoff Latency Matrix (Heatmap)</h3>
                
                <div className="grid grid-cols-7 gap-2 font-mono text-[9px] text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-ink3 font-semibold mb-2">{day}</div>
                  ))}
                  
                  {/* Heatmap cells */}
                  {[
                    { val: '1.2h', color: 'bg-teal-m/20 text-teal-m border border-teal-m/30' },
                    { val: '1.5h', color: 'bg-teal-m/30 text-teal-m border border-teal-m/40' },
                    { val: '3.4h', color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
                    { val: '1.1h', color: 'bg-teal-m/20 text-teal-m border border-teal-m/30' },
                    { val: '0.9h', color: 'bg-teal-d/20 text-teal-m border border-teal-m/25' },
                    { val: '4.8h', color: 'bg-red-500/25 text-red-300 border border-red-500/30 animate-pulse' },
                    { val: '2.1h', color: 'bg-yellow-500/10 text-yellow-300 border border-white/5' }
                  ].map((cell, idx) => (
                    <div key={idx} className={`p-4 rounded-lg font-bold flex items-center justify-center ${cell.color}`}>
                      {cell.val}
                    </div>
                  ))}
                </div>
                
                <div className="text-[9px] text-ink3/80 mt-4 leading-relaxed">
                  ⚠️ **Red Alert:** Friday coordination latency spiked due to manual insurance validation holdups. Direct ABDM API bypass recommended.
                </div>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* PIN Confirmation modal */}
      {pinConfirmOpen && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm glass border border-white/10 rounded-2xl p-6 space-y-5 text-left animate-[fadeUp_0.2s_ease]">
            <div>
              <h3 className="font-serif text-base text-white">Electronic Signature Authorization</h3>
              <p className="text-[10px] text-ink3 mt-1 leading-relaxed">
                Confirm your clinical identity to sign the document hash immutably. Enter professional authorization PIN (Default: `1234`).
              </p>
            </div>

            {pinError && (
              <div className="p-3 bg-red-l/10 border border-red-500/20 rounded text-[10px] text-red-300 font-medium">
                ⚠️ {pinError}
              </div>
            )}

            <div>
              <label className="block text-[9px] font-mono uppercase tracking-wider text-ink3 mb-2">Authorization PIN</label>
              <input
                type="password"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="••••"
                className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:border-teal-m"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPinConfirmOpen(false)}
                className="flex-1 text-center font-semibold text-xs bg-white/5 hover:bg-white/10 text-white rounded-lg py-2.5 transition border border-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 text-center font-bold text-xs gradient-teal hover:opacity-95 text-white rounded-lg py-2.5 transition cursor-pointer shadow-md shadow-teal-m/10"
              >
                Verify & Sign
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
