'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter phone input to strictly numbers and max 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: onlyDigits });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Full Name check
    if (formData.fullName.trim().length < 3) {
      setError('Full Name must be at least 3 characters long.');
      return;
    }

    // 2. Mobile number constraint check
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9.');
      return;
    }

    // 3. Email constraint check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    // 4. Password constraint check
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 5. Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Account registered successfully! Redirecting to login...');
        router.push('/login');
      } else {
        setError(data.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setError(err.message || 'A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl border border-slate-200 space-y-6">
        
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
            Humane Touch Trust
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">New Student Registration</h1>
          <p className="text-xs text-slate-500">
            Register to apply for the Udaan Higher Education Scholarship
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs font-bold text-rose-800 flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mohammed Farhan"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mobile Number (10 Digits) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono font-bold text-slate-400 text-xs">+91</span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full pl-12 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold tracking-wider"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Must start with 6, 7, 8, or 9 (no +91 or 0 prefix needed).</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. farhan@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Validating & Registering...' : 'Register Student Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-amber-700 hover:underline">
            Log In Here
          </Link>
        </div>

      </div>
    </div>
  );
}