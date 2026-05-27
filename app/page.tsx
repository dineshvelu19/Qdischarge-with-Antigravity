import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ink via-ink2 to-ink">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-6 md:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-teal flex items-center justify-center shadow-lg shadow-teal-m/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-white">Qdischarge</span>
            <span className="ml-2 font-mono text-[9px] bg-teal-m/20 text-teal-m border border-teal-m/35 rounded-full px-2 py-0.5">v2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-semibold text-foreground/80 hover:text-white transition">
            Sign In
          </Link>
          <Link href="/signup" className="text-xs font-semibold gradient-teal hover:opacity-90 text-white rounded-lg px-4 py-2 shadow-md shadow-teal-m/10 transition">
            Create Account
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col items-center text-center">
        
        {/* Compliance Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="text-[10px] font-mono uppercase tracking-wider bg-teal-l/15 text-teal-m border border-teal-m/25 rounded-md px-3 py-1 font-semibold">
            NABH COP.9 Compliant
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider bg-blue-l/15 text-blue-400 border border-blue-500/25 rounded-md px-3 py-1 font-semibold">
            HL7 FHIR R4 Standard
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider bg-purple-l/15 text-purple-400 border border-purple-500/25 rounded-md px-3 py-1 font-semibold">
            ABDM / NHCX Enabled
          </span>
        </div>

        {/* Hero Copy */}
        <h1 className="font-serif text-4xl md:text-6xl text-white tracking-tight leading-tight max-w-4xl mb-6">
          AI-Driven Discharge Summary & <br />
          <span className="text-transparent bg-clip-text gradient-teal">Multi-Department Automation</span>
        </h1>
        
        <p className="text-sm md:text-base text-ink3 leading-relaxed max-w-2xl mb-12">
          Empowering Indian hospitals with a frictionless, regulatory-aligned discharge system. Auto-draft complete clinical documentation in seconds, coordinate real-time approvals, and eliminate claims settlement delays.
        </p>

        {/* Hero CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/dashboard" className="text-sm font-bold gradient-teal hover:opacity-95 text-white rounded-xl px-8 py-4 shadow-lg shadow-teal-m/20 transition text-center min-w-[200px]">
            Launch Clinical Portal
          </Link>
          <a href="#workflow" className="text-sm font-bold glass hover:bg-white/5 border border-white/10 text-white rounded-xl px-8 py-4 transition text-center min-w-[200px]">
            Explore 6-Phase System
          </a>
        </div>

        {/* Workflow Showcase Section */}
        <section id="workflow" className="w-full pt-16 border-t border-white/5">
          <h2 className="font-serif text-2xl md:text-3xl text-white mb-4">Inside the Qdischarge Framework</h2>
          <p className="text-xs text-ink3 max-w-xl mx-auto mb-12">
            Our systematic pathway covers critical checkpoints from bedside clinical assessment to final audit trail verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Phase 1 */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="text-2xl mb-4">🩺</div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-teal-m mb-2">01. Initiation & EDT</h3>
              <p className="text-xs text-ink3 leading-relaxed">
                Confirm bedside hemodynamics, log Estimated Discharge Time (EDT), and auto-dispatch instant tasks to Pharmacy, Nursing, and Billing.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="text-2xl mb-4">🤖</div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-teal-m mb-2">02. AI Auto-Draft</h3>
              <p className="text-xs text-ink3 leading-relaxed">
                Automatically retrieve labs, diagnostics, and prescriptions via FHIR APIs to compose summaries with compliant ICD-10 medical coding.
              </p>
            </div>

            {/* Phase 3 */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="text-2xl mb-4">🔀</div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-teal-m mb-2">03. Department Handoff</h3>
              <p className="text-xs text-ink3 leading-relaxed">
                Track real-time clearances. Ward pharmacists package meds, billing updates insurance pre-authorizations, and bed coordinators schedule turnover.
              </p>
            </div>

            {/* Phase 4 */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="text-2xl mb-4">📋</div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-teal-m mb-2">04. NABH Compliance Gate</h3>
              <p className="text-xs text-ink3 leading-relaxed">
                Enforce mandatory fields, lock electronic signatures, and record complete, tamper-proof medico-legal audit logs.
              </p>
            </div>

            {/* Phase 5 */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="text-2xl mb-4">📱</div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-teal-m mb-2">05. Patient Notification</h3>
              <p className="text-xs text-ink3 leading-relaxed">
                Send instructions, dosage schedules, and outpatient appointment slips directly via WhatsApp, SMS, and secure online portal.
              </p>
            </div>

            {/* Phase 6 */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="text-2xl mb-4">📊</div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-teal-m mb-2">06. Performance Analytics</h3>
              <p className="text-xs text-ink3 leading-relaxed">
                Analyze operational Turnaround Time (TAT), delay heatmaps, and billing bottlenecks through the unified hospital dashboard.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 text-center text-[11px] text-ink3/60">
        <p>A QTV Product · Bengaluru · Empowering Talent. Enabling Growth.</p>
        <p className="mt-1">Dinesh Velusamy · Dr. JaiKanna · Quench Techno Valley</p>
      </footer>

    </div>
  )
}
