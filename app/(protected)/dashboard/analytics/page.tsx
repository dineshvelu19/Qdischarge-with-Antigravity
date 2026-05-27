'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useUser } from '@/hooks/useUser'

export default function AnalyticsDashboard() {
  const { user } = useUser()

  return (
    <div className="min-h-screen flex flex-col bg-ink text-foreground">
      
      {/* ── TOPBAR ── */}
      <header className="bg-ink2 border-b border-white/5 px-6 md:px-12 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-ink3 hover:text-white transition flex items-center gap-1.5 text-xs font-mono">
            ← Dashboard
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <span className="font-serif text-base font-bold tracking-tight text-white">Qdischarge Analytics</span>
            <span className="text-[9px] text-teal-m ml-2 font-mono uppercase tracking-wider">Operational Node</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-ink3 font-mono">
          <span>Weekly Report</span>
          <span className="bg-teal-m/15 text-teal-m px-2 py-0.5 rounded border border-teal-m/20">
            NABH COP.9 Roster
          </span>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 md:px-12 py-8 space-y-8">
        
        {/* HERO TITLE */}
        <div className="text-left">
          <h1 className="font-serif text-2xl text-white mb-2">Hospital Turnaround Time (TAT) Overview</h1>
          <p className="text-xs text-ink3 leading-relaxed max-w-xl">
            Live operational intelligence compiled from Ward 4B and specialty medicine blocks. Standardized against national health data systems.
          </p>
        </div>

        {/* METRICS ROW */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-6 border border-white/5 space-y-2 text-left">
            <span className="text-3xl font-serif text-teal-m font-bold">2.8 hrs</span>
            <h3 className="text-[10px] text-ink3 font-mono uppercase tracking-wider">Median Handoff TAT</h3>
            <p className="text-[9px] text-ink3/80 leading-relaxed">
              Measured from bedside order placement to patient physical discharge slip generation.
            </p>
          </div>
          <div className="glass rounded-xl p-6 border border-white/5 space-y-2 text-left">
            <span className="text-3xl font-serif text-blue-400 font-bold">94.2%</span>
            <h3 className="text-[10px] text-ink3 font-mono uppercase tracking-wider">ICD-10 Sync Accuracy</h3>
            <p className="text-[9px] text-ink3/80 leading-relaxed">
              Successful automated database mappings without manual billing executive override corrections.
            </p>
          </div>
          <div className="glass rounded-xl p-6 border border-white/5 space-y-2 text-left">
            <span className="text-3xl font-serif text-purple-400 font-bold">96.8%</span>
            <h3 className="text-[10px] text-ink3 font-mono uppercase tracking-wider">NABH Std Conformance</h3>
            <p className="text-[9px] text-ink3/80 leading-relaxed">
              Completeness checks passed during electronic digital signature locking checks.
            </p>
          </div>
        </section>

        {/* DETAILED STATS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Department breakdown */}
          <div className="glass rounded-xl p-6 border border-white/5 text-left space-y-4">
            <h3 className="font-serif text-sm text-white border-b border-white/5 pb-2">Operational Latency by Department</h3>
            
            <div className="space-y-4 font-sans text-xs">
              {[
                { name: 'Clinical Pharmacy (Rx Pack prep)', value: '45 mins', color: 'w-3/4 bg-teal-m' },
                { name: 'Ward Nursing (Vitals & IV removal)', value: '25 mins', color: 'w-1/2 bg-teal-m' },
                { name: 'Billing Executive (Insurance claim settlement)', value: '1.8 hrs', color: 'w-full bg-red-400' },
                { name: 'Care Plan Referrals (Follow-up bookings)', value: '15 mins', color: 'w-1/4 bg-teal-m' },
                { name: 'Housekeeping Bed Turnover (Turnaround)', value: '30 mins', color: 'w-2/3 bg-teal-m' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white font-medium">{item.name}</span>
                    <span className="text-ink3 font-mono">{item.value}</span>
                  </div>
                  <div className="w-full bg-ink/50 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* JCI checklist compliance list */}
          <div className="glass rounded-xl p-6 border border-white/5 text-left space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-sm text-white border-b border-white/5 pb-2">JCI Documentation Quality Gate</h3>
              <ul className="space-y-3 mt-4 text-xs leading-relaxed text-foreground/80 list-disc pl-5">
                <li>Estimated Discharge Time (EDT) logging mandatory — **100% Enforced**</li>
                <li>Side-by-side Medication Reconciliation preview completed — **100% Enforced**</li>
                <li>Digital clinical signature lock applied to case file hash — **100% Enforced**</li>
                <li>Printable DynaSlip instructions generated in regional language — **100% Enforced**</li>
              </ul>
            </div>
            <div className="p-3 bg-white/2 rounded-lg border border-white/5 text-[10px] text-ink3 leading-relaxed">
              💡 **Analysis Recommendation:** Direct insurance claim integration via ABDM National Health Claims Exchange (NHCX) reduces billing latency by **45 mins** compared to manual insurer web portals.
            </div>
          </div>

        </section>

      </main>

      <footer className="border-t border-white/5 py-6 text-center text-[10px] text-ink3/40 mt-12">
        Operational Intelligence Node · Quench Techno Valley
      </footer>

    </div>
  )
}
