import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

const steps = [
  ['01', 'Apply once', 'Complete one guided application and keep your reference number close.'],
  ['02', 'Meet your volunteer', 'Your assigned volunteer verifies the application and uploaded documents.'],
  ['03', 'Trustee review', 'A trustee completes the interview and records a recommendation.'],
  ['04', 'Final decision', 'The trust admin completes the final approval and award documents.'],
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const destination = user?.role === 'ADMIN' ? '/admin' : user?.role === 'TRUSTEE' ? '/trustee' : user?.role === 'VOLUNTEER' ? '/volunteer' : '/student/dashboard';

  return (
    <div className="space-y-16 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#172a23] text-white shadow-2xl shadow-emerald-950/15">
        <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -right-4 -top-16 h-64 w-64 rounded-full border border-amber-200/15" />
        <div className="relative grid items-center gap-10 px-7 py-14 sm:px-12 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:px-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-100/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Udaan · Higher Education Scholarship
            </div>
            <h1 className="mt-7 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">A little support can change the <span className="font-serif italic text-amber-200">whole journey.</span></h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-emerald-50/75 sm:text-base">Humane Touch Trust helps deserving students continue higher education through merit-cum-means scholarships and direct tuition support.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={user ? destination : '/register'} className="rounded-xl bg-amber-300 px-6 py-3.5 text-center text-sm font-black text-[#172a23] shadow-lg shadow-black/10 transition hover:bg-amber-200">{user ? 'Open your portal' : 'Start your application'} <span aria-hidden="true">→</span></Link>
              <Link href={user ? '/login' : '/login'} className="rounded-xl border border-white/20 px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-white/10">{user ? 'Switch account' : 'Sign in to your account'}</Link>
            </div>
            <p className="mt-5 text-[11px] text-emerald-100/55">Secure registration · Guided application · Clear review stages</p>
          </div>
          <div className="relative mx-auto w-full max-w-sm rounded-[1.75rem] border border-white/15 bg-white/[.07] p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-amber-200">One application</p><h2 className="mt-2 text-xl font-semibold">One clear path forward</h2></div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-200 text-xl text-[#172a23]">✦</span>
            </div>
            <div className="mt-8 space-y-5">
              {steps.map(([number, title, description], index) => <div className="flex gap-4" key={number}>
                <div className="flex flex-col items-center"><span className="grid h-8 w-8 place-items-center rounded-full border border-amber-100/30 text-[10px] font-black text-amber-200">{number}</span>{index < steps.length - 1 && <span className="mt-1 h-7 w-px bg-white/15" />}</div>
                <div className="pb-2"><h3 className="text-sm font-bold text-white">{title}</h3><p className="mt-1 text-xs leading-5 text-emerald-50/60">{description}</p></div>
              </div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['01', 'Merit meets need', 'Scholarship support is guided by academic progress and family circumstances.'],
          ['02', 'Tuition goes direct', 'Approved support is intended for education costs and institution fee payments.'],
          ['03', 'People behind every step', 'Volunteers, trustees, and administrators each review their part of the process.'],
        ].map(([n, title, copy]) => <article key={n} className="portal-panel rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-lg">
          <span className="font-mono text-xs font-bold text-amber-700">{n} / UDAAN</span><h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
        </article>)}
      </section>
    </div>
  );
}
