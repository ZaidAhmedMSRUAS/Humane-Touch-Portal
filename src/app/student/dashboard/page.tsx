'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CertificateModal from '@/components/documents/CertificateModal';
import AwardLetterModal from '@/components/documents/AwardLetterModal';

export default function StudentDashboardPage() {
  const [application, setApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [awardLetterModalOpen, setAwardLetterModalOpen] = useState(false);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/application');
      const data = await res.json();
      if (res.ok && data.application) {
        setApplication(data.application);
      }
    } catch (err) {
      console.error('Error loading application:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  const isApproved = application?.status === 'APPROVED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
          Udaan Scholar Portal
        </span>
        <h1 className="text-2xl font-black mt-2">Scholarship Application & Document Desk</h1>
        <p className="text-xs text-slate-300 mt-1">
          Track application status, review grant details, and download official documents upon Trustee approval
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-12 text-center">Loading your scholarship record...</p>
      ) : !application ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <h2 className="text-base font-black text-slate-900">No Application Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You have not submitted an application for the 2026-27 Udaan Scholarship cycle yet.
          </p>
          <Link
            href="/apply"
            className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition"
          >
            Apply for Scholarship Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Status & Grant Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-bold block">Application Reference</span>
                <span className="text-base font-black font-mono text-amber-800">{application.referenceNumber}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-bold block">Current Status</span>
                <span className={`px-3 py-1 font-black rounded-xl text-xs inline-block border ${
                  isApproved ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {isApproved ? '✓ Grant Approved by Trustees' : application.status}
                </span>
              </div>
            </div>

            {/* Candidate Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-slate-400 text-[10px] block">Course Name</span>
                <span className="font-bold text-slate-900">{application.courseName}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-slate-400 text-[10px] block">Institution</span>
                <span className="font-bold text-slate-900">{application.collegeName}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-slate-400 text-[10px] block">Academic Marks</span>
                <span className="font-bold text-amber-800">{application.previousScoreMarks}%</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-slate-400 text-[10px] block">Sanctioned Grant</span>
                <span className="font-mono font-bold text-emerald-800">
                  {application.sanctionedAmount ? `₹${application.sanctionedAmount.toLocaleString('en-IN')}` : 'Pending Sanction'}
                </span>
              </div>
            </div>

            {/* Document Download Section: Only accessible when Approved by Trustees */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Official Scholarship Documents
              </h3>

              {isApproved ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setCertificateModalOpen(true)}
                    className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    🎓 View & Download Certificate of Accomplishment
                  </button>
                  <button
                    onClick={() => setAwardLetterModalOpen(true)}
                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    📜 View & Download Scholarship Award Letter
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>⏳</span> Documents Locked Pending Trustee Approval
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Your Certificate and official Award Letter will become available for download immediately after your application and interview evaluation are sanctioned by the Board of Trustees.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* DOCUMENT MODALS */}
      {certificateModalOpen && application && (
        <CertificateModal
          app={application}
          onClose={() => setCertificateModalOpen(false)}
        />
      )}

      {awardLetterModalOpen && application && (
        <AwardLetterModal
          app={application}
          onClose={() => setAwardLetterModalOpen(false)}
        />
      )}

    </div>
  );
}