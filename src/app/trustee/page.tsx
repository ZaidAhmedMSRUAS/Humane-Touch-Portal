'use client';
import React, { useState, useEffect } from 'react';
import CertificateModal from '@/components/documents/CertificateModal';
import AwardLetterModal from '@/components/documents/AwardLetterModal';

export default function TrusteeDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // In-Portal Modal States
  const [certificateModalApp, setCertificateModalApp] = useState<any | null>(null);
  const [awardLetterModalApp, setAwardLetterModalApp] = useState<any | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/actions');
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications for trustees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const totalSanctioned = applications.reduce((acc, app) => acc + (app.sanctionedAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Board of Trustees Portal
          </span>
          <h1 className="text-2xl font-black mt-2">Scholarship Review & Document Issuance</h1>
          <p className="text-xs text-slate-300 mt-1">
            Access scholar profiles, verify grant disbursals, and generate official Certificates and Award Letters in-portal
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Scholars</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{applications.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Sanctioned Grants</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalSanctioned.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Active Program</p>
          <p className="text-2xl font-black text-amber-600 mt-1">Udaan 2026-27</p>
        </div>
      </div>

      {/* Applications & Document Generation Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-black text-slate-900 mb-4">Scholar Application Records</h2>

        {loading ? (
          <p className="text-xs text-slate-400 py-8 text-center">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No applications currently available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Scholar Name</th>
                  <th className="py-3 px-4">Course & College</th>
                  <th className="py-3 px-4">Grant Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">In-Portal Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                      {app.referenceNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{app.student?.fullName}</div>
                      <div className="text-[11px] text-slate-400">{app.student?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.courseName}</div>
                      <div className="text-[11px] text-slate-400">{app.collegeName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      ₹{(app.sanctionedAmount || app.annualTuitionFee || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-lg text-[10px] border border-amber-200">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* In-Portal Certificate Button */}
                        <button
                          onClick={() => setCertificateModalApp(app)}
                          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-[11px] transition shadow-sm cursor-pointer"
                        >
                          🎓 Certificate
                        </button>

                        {/* In-Portal Award Letter Button */}
                        <button
                          onClick={() => setAwardLetterModalApp(app)}
                          className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-xl text-[11px] transition shadow-sm cursor-pointer"
                        >
                          📜 Award Letter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* In-Portal Modals */}
      {certificateModalApp && (
        <CertificateModal
          app={certificateModalApp}
          onClose={() => setCertificateModalApp(null)}
        />
      )}

      {awardLetterModalApp && (
        <AwardLetterModal
          app={awardLetterModalApp}
          onClose={() => setAwardLetterModalApp(null)}
        />
      )}

    </div>
  );
}