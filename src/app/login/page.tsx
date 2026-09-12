'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'STUDENT' | 'VOLUNTEER' | 'ADMIN' | 'TRUSTEE'>('STUDENT');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Status indicators
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const res = await signIn('credentials', {
      phone: loginPhone,
      password: loginPassword,
      role: loginRole,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(`No active ${loginRole} profile found for this mobile number or incorrect password.`);
    } else {
      if (loginRole === 'ADMIN') router.push('/admin');
      else if (loginRole === 'TRUSTEE') router.push('/trustee');
      else if (loginRole === 'VOLUNTEER') router.push('/volunteer');
      else router.push('/student');
      router.refresh();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          phone: regPhone,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Failed to register account.');
      } else {
        setSuccess('Account created successfully! Signing you in...');
        const autoLogin = await signIn('credentials', {
          phone: regPhone,
          password: regPassword,
          role: 'STUDENT',
          redirect: false,
        });

        if (!autoLogin?.error) {
          router.push('/student');
          router.refresh();
        } else {
          setActiveTab('LOGIN');
          setLoginPhone(regPhone);
          setLoginRole('STUDENT');
          setSuccess('Account created! Please sign in with your credentials.');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('A network error occurred. Please try again.');
    }
  };

  return (
    <div 
      className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 overflow-hidden rounded-3xl my-4 bg-cover bg-center bg-no-repeat shadow-2xl border border-slate-300"
      style={{ backgroundImage: "url('/banner.jpeg')" }}
    >
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10">
        
        {/* Left Info Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-700/50">
          <div className="relative space-y-4">
            <div className="inline-block bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100">
              <img 
                src="/logo.png" 
                alt="Humane Touch Logo" 
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>

            <div>
              <div className="inline-block bg-amber-400/20 text-amber-300 font-bold px-3 py-1 rounded-full text-[11px] tracking-wide uppercase border border-amber-400/30">
                Udaan Scholarship Program
              </div>
              <h2 className="text-xl font-black text-white mt-2 tracking-tight">
                Humane Touch Trust
              </h2>
              <p className="text-xs text-slate-400">Estd. 1999 • Regd. Public Charitable Trust</p>
            </div>
          </div>

          <div className="relative my-6 space-y-4">
            <blockquote className="text-xs sm:text-sm font-normal text-slate-200 leading-relaxed italic border-l-2 border-amber-400 pl-3.5">
              "Educating a deserving mind is not charity; it is an investment in human dignity and community transformation."
            </blockquote>
            
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Disbursal</span>
                <strong className="text-xs text-amber-300 font-bold">100% Direct</strong>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Verification</span>
                <strong className="text-xs text-emerald-300 font-bold">In-Person Audit</strong>
              </div>
            </div>
          </div>

          <div className="relative text-[11px] text-slate-400">
            Bengaluru, Karnataka • Empowering Higher Education
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white/95">
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('LOGIN'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'LOGIN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('REGISTER'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'REGISTER' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              New Student Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center space-x-2">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Sign in as Role:
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  {(['STUDENT', 'VOLUNTEER', 'ADMIN', 'TRUSTEE'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setLoginRole(r)}
                      className={`py-2 rounded-lg transition text-[11px] ${
                        loginRole === r
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {r === 'ADMIN' ? '⚙️ Admin' : r === 'TRUSTEE' ? '🏛️ Trustee' : r === 'VOLUNTEER' ? '📱 Volunteer' : '🎓 Student'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full text-sm border border-slate-300 rounded-xl pl-12 pr-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none transition bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[11px] font-bold text-amber-600 hover:text-amber-800 transition">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none transition bg-slate-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition transform active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : `Sign In as ${loginRole}`}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Mohammed Farhan"
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-amber-500 outline-none transition bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full text-sm border border-slate-300 rounded-xl pl-11 pr-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none transition bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none transition bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none transition bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none transition bg-slate-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition transform active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {loading ? 'Registering...' : 'Register & Apply for Udaan'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition">
              ← Return to Main Page
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}