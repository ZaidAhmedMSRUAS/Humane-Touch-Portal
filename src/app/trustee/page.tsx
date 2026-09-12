'use client';
import React, { useState, useEffect } from 'react';
import SanctionLetterPDF from '@/components/SanctionLetterPDF';
import CertificatePDF from '@/components/CertificatePDF';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export default function TrusteePage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  
  // Modals
  const [selectedLetterApp, setSelectedLetterApp] = useState<any | null>(null);
  const [selectedCertApp, setSelectedCertApp] = useState<any | null>(null);
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);

  // Active candidate for In-Person Interview
  const [activeInterviewApp, setActiveInterviewApp] = useState<any | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewRemarks: '',
    interviewScore: 9,
    sanctionedAmount: '',
    decision: 'APPROVE',
  });

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openInterviewModal = (app: any) => {
    setActiveInterviewApp(app);
    setInterviewForm({
      interviewRemarks: '',
      interviewScore: 9,
      sanctionedAmount: app.annualTuitionFee.toString(),
      decision: 'APPROVE',
    });
  };

  const handleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterviewApp) return;

    setSubmittingId(activeInterviewApp.id);
    try {
      const res = await fetch('/api/sanction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: activeInterviewApp.id,
          ...interviewForm,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Trustee In-Person Interview recorded and grant decision finalized!');
        setActiveInterviewApp(null);
        fetchApplications();
      } else {
        alert(data.error || 'Failed to submit trustee decision.');
      }
    } catch (err) {
      alert('Network error submitting decision.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-amber-400/20 text-amber-300 text-[11px] font-bold rounded-full uppercase tracking-wider border border-amber-400/30">
            Governance & Sanction Panel
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Trustee Governance Cockpit</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Humane Touch Trust • Conduct candidate interviews, issue grants & award certificates
          </p>
        </div>

        <button
          onClick={() => setIsPwdModalOpen(true)}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center space-x-2"
        >
          <span>🔒</span>
          <span>Change Password</span>
        </button>
      </div>

      {/* Applications Roster */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-black text-slate-900">Candidate Evaluation & Award Roster</h3>

        {loading ? (
          <p className="text-xs text-slate-400">Loading candidate dossiers...</p>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-2xl">🎓</span>
            <p className="text-xs font-bold text-slate-700 mt-2">No applications currently pending interview.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="p-4">Ref & Candidate</th>
                  <th className="p-4">Academic & Financials</th>
                  <th className="p-4">Volunteer Doc Check</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Trustee Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <span className="font-mono text-amber-700 font-bold block text-[10px]">
                        {app.referenceNumber || 'HT/26-27/0001'}
                      </span>
                      <strong className="text-slate-900 block text-sm">{app.student?.fullName}</strong>
                      <span className="text-slate-500">{app.courseName}</span>
                      <span className="block text-[11px] text-slate-400">{app.collegeName}</span>
                    </td>

                    <td className="p-4">
                      <span className="block text-emerald-700 font-bold">{app.previousScoreMarks}% Score</span>
                      <span className="text-slate-500">Income: ₹{Number(app.familyAnnualIncome).toLocaleString('en-IN')}</span>
                      <span className="block text-slate-700 font-semibold">Fee: ₹{Number(app.annualTuitionFee).toLocaleString('en-IN')}</span>
                    </td>

                    <td className="p-4 max-w-[220px]">
                      {app.verificationReport ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-700 font-bold block text-[11px]">✓ Docs & Cheque Payee Verified</span>
                          <span className="text-[10px] text-slate-600 block truncate">
                            <strong>Payee:</strong> {app.chequeInFavourOf || app.verificationReport.chequePayeeVerified}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending volunteer doc audit</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        app.status === 'TRUSTEE_INTERVIEW' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-1.5">
                      {app.status === 'APPROVED' ? (
                        <>
                          <button
                            onClick={() => setSelectedCertApp(app)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-sm transition"
                          >
                            🎖️ Certificate
                          </button>
                          <button
                            onClick={() => setSelectedLetterApp(app)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition"
                          >
                            📄 Award Letter
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openInterviewModal(app)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-sm transition"
                        >
                          Conduct In-Person Interview
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* In-Person Interview & Sanction Modal */}
      {activeInterviewApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">{activeInterviewApp.referenceNumber}</span>
                <h3 className="text-base font-bold text-slate-900">{activeInterviewApp.student?.fullName}</h3>
              </div>
              <button
                onClick={() => setActiveInterviewApp(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Volunteer Audit Findings</span>
              <p><strong>Cheque Payee:</strong> {activeInterviewApp.chequeInFavourOf || activeInterviewApp.collegeName}</p>
              <p><strong>Remarks:</strong> {activeInterviewApp.verificationReport?.volunteerRemarks || 'Verified authentic.'}</p>
            </div>

            <form onSubmit={handleInterviewSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Interview Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={interviewForm.interviewScore}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewScore: Number(e.target.value) })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grant Decision</label>
                  <select
                    value={interviewForm.decision}
                    onChange={(e) => setInterviewForm({ ...interviewForm, decision: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="APPROVE">Approve & Sanction</option>
                    <option value="REJECT">Reject Application</option>
                  </select>
                </div>
              </div>

              {interviewForm.decision === 'APPROVE' && (
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Sanctioned Grant Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={interviewForm.sanctionedAmount}
                    onChange={(e) => setInterviewForm({ ...interviewForm, sanctionedAmount: e.target.value })}
                    placeholder="e.g. 45000"
                    className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trustee Assessment Observations *</label>
                <textarea
                  rows={3}
                  required
                  value={interviewForm.interviewRemarks}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewRemarks: e.target.value })}
                  placeholder="Record interview observations, career clarity, and family commitment..."
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveInterviewApp(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingId === activeInterviewApp.id}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submittingId === activeInterviewApp.id ? 'Recording...' : 'Finalize Sanction & Award'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Modals */}
      {selectedLetterApp && (
        <SanctionLetterPDF
          application={selectedLetterApp}
          onClose={() => setSelectedLetterApp(null)}
        />
      )}

      {selectedCertApp && (
        <CertificatePDF
          application={selectedCertApp}
          onClose={() => setSelectedCertApp(null)}
        />
      )}

      <ChangePasswordModal
        isOpen={isPwdModalOpen}
        onClose={() => setIsPwdModalOpen(false)}
      />
    </div>
  );
}