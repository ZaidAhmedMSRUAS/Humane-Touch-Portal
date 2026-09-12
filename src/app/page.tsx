import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold text-amber-800 mb-6">
        <span>🎓 Udaan Higher Education Scholarship Program</span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-3xl leading-tight">
        Humane Touch Trust
      </h1>

      <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
        Merit-cum-means scholarship processing engine empowering deserving minds across Karnataka through direct tuition disbursal.
      </p>

      {user ? (
        /* Logged In View */
        <div className="mt-8 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Currently Logged In As:
          </span>
          <p className="text-base font-black text-slate-900">
            {user.name} ({user.role})
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Link
              href={
                user.role === 'ADMIN'
                  ? '/admin'
                  : user.role === 'TRUSTEE'
                  ? '/trustee'
                  : user.role === 'VOLUNTEER'
                  ? '/volunteer'
                  : '/student'
              }
              className="w-full sm:flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
            >
              Enter Dashboard →
            </Link>
            <Link
              href="/login"
              className="w-full sm:flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Switch Account
            </Link>
          </div>
        </div>
      ) : (
        /* Logged Out View */
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition"
          >
            Portal Login / Register
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-4xl text-left">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm">Merit-Cum-Means</h3>
          <p className="text-xs text-slate-500 mt-1">Socio-economic grant allocations for college degree programs.</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm">Direct Disbursal</h3>
          <p className="text-xs text-slate-500 mt-1">100% of sanctioned aid transferred directly to institutions.</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm">Field Audited</h3>
          <p className="text-xs text-slate-500 mt-1">In-person residential verification conducted by trust volunteers.</p>
        </div>
      </div>
    </div>
  );
}