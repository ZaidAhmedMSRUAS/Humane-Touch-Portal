'use client';
import React, { useState, useEffect } from 'react';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export default function VolunteerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  
  const [reportForm, setReportForm] = useState({
    marksCardVerified: true,
    incomeCertificateVerified: true,
    feeDemandNoteVerified: true,
    chequePayeeVerified: '',
    volunteerRemarks: '',
    isRecommended: true,
  });

  const [activeAppForAudit, setActiveAppForAudit] = useState<any | null>(null);

  const fetchAssigned = async () => {
    try {
      setLoading(true);
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
    fetchAssigned();
  }, []);

  const openAuditModal = (app: any) => {
    setActiveAppForAudit(app);
    setReportForm({
      marksCardVerified: true,
      incomeCertificateVerified: true,
      feeDemandNoteVerified: true,
      chequePayeeVerified: app.chequeInFavourOf || app.collegeName || '',
      volunteerRemarks: '',
      isRecommended: true,
    });
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppForAudit) return;

    setSubmittingId(activeAppForAudit.id);
    try {
      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: activeAppForAudit.id,
          ...reportForm,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Document audit complete! Dossier forwarded for Trustee Interview.');
        setActiveAppForAudit(null);
        fetchAssigned();
      } else {
        alert(data.error || 'Failed to submit document verification.');
      }
    } catch (err) {
      alert('Network error submitting document report.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-amber-400/20 text-amber-300 text-[11px] font-bold rounded-full uppercase tracking-wider border border-amber-400/30">
            Document & Cheque Payee Verification
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Volunteer Verification Console</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Humane Touch Trust • In-person document verification & institution cheque payee audit
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

      {/* Task List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">Assigned Verification Tasks</h3>
            <p className="text-xs text-slate-500">Inspect uploaded documents & confirm bank payee details</p>
          </div>
          <button
            onClick={fetchAssigned}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 p-8 text-center">Loading assigned tasks...</p>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-2xl">📋</span>
            <p className="text-xs font-bold text-slate-700 mt-2">No verification tasks available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((app) => (
              <div key={app.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-amber-700 font-bold block text-[11px]">
                      {app.referenceNumber || 'HT/26-27/APP'}
                    </span>
                    <strong className="text-sm text-slate-900 block">{app.student?.fullName || 'Student'}</strong>
                    <span className="text-slate-500 font-semibold">{app.courseName} • {app.collegeName}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase ${
                    app.status === 'TRUSTEE_INTERVIEW' ? 'bg-purple-100 text-purple-800' :
                    app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-amber-100 text-amber-900'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                  <p><strong>📞 Contact:</strong> {app.student?.phone || 'N/A'}</p>
                  <p><strong>📊 Academic Score:</strong> {app.previousScoreMarks}%</p>
                  <p><strong>💰 Tuition Fee:</strong> ₹{Number(app.annualTuitionFee).toLocaleString('en-IN')}</p>
                </div>

                {app.status === 'DOC_VERIFICATION' || app.status === 'SUBMITTED' ? (
                  <button
                    onClick={() => openAuditModal(app)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition text-xs shadow-sm"
                  >
                    Inspect Uploaded Docs & Verify Cheque Payee
                  </button>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] font-semibold text-center">
                    ✓ Document audit completed & forwarded to Trustees
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Verification & Inspection Modal */}
      {activeAppForAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">{activeAppForAudit.referenceNumber}</span>
                <h3 className="text-base font-bold text-slate-900">{activeAppForAudit.student?.fullName}</h3>
              </div>
              <button
                onClick={() => setActiveAppForAudit(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Uploaded Documents Quick Links */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Uploaded Student Documents</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {activeAppForAudit.docStudentAadhaar && (
                  <a href={activeAppForAudit.docStudentAadhaar} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 flex justify-between font-semibold hover:border-amber-400">
                    <span>Student Aadhaar</span> <span className="text-amber-600 font-bold">Open ↗</span>
                  </a>
                )}
                {activeAppForAudit.docParentAadhaar && (
                  <a href={activeAppForAudit.docParentAadhaar} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 flex justify-between font-semibold hover:border-amber-400">
                    <span>Parent Aadhaar</span> <span className="text-amber-600 font-bold">Open ↗</span>
                  </a>
                )}
                {activeAppForAudit.docIncomeCaste && (
                  <a href={activeAppForAudit.docIncomeCaste} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 flex justify-between font-semibold hover:border-amber-400">
                    <span>Income/Caste</span> <span className="text-amber-600 font-bold">Open ↗</span>
                  </a>
                )}
                {activeAppForAudit.docMarksCards && (
                  <a href={activeAppForAudit.docMarksCards} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 flex justify-between font-semibold hover:border-amber-400">
                    <span>Marks Cards</span> <span className="text-amber-600 font-bold">Open ↗</span>
                  </a>
                )}
                {activeAppForAudit.docFeeDemandNote && (
                  <a href={activeAppForAudit.docFeeDemandNote} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 flex justify-between font-semibold hover:border-amber-400">
                    <span>Fee Demand</span> <span className="text-amber-600 font-bold">Open ↗</span>
                  </a>
                )}
                {activeAppForAudit.docDeathDivorceCert && (
                  <a href={activeAppForAudit.docDeathDivorceCert} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 flex justify-between font-semibold hover:border-amber-400">
                    <span>Death/Divorce</span> <span className="text-amber-600 font-bold">Open ↗</span>
                  </a>
                )}
              </div>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportForm.marksCardVerified}
                    onChange={(e) => setReportForm({ ...reportForm, marksCardVerified: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-semibold text-slate-700">Marks cards verified against stated marks ({activeAppForAudit.previousScoreMarks}%)</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportForm.feeDemandNoteVerified}
                    onChange={(e) => setReportForm({ ...reportForm, feeDemandNoteVerified: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-semibold text-slate-700">College fee structure / demand letter verified</span>
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Cheque in Favour Of (Verified Official College Payee Name) *
                </label>
                <input
                  type="text"
                  required
                  value={reportForm.chequePayeeVerified}
                  onChange={(e) => setReportForm({ ...reportForm, chequePayeeVerified: e.target.value })}
                  placeholder="e.g. Principal, St. Joseph's University"
                  className="w-full text-sm font-bold text-slate-800 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/40"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Volunteer Remarks *</label>
                <textarea
                  rows={2}
                  required
                  value={reportForm.volunteerRemarks}
                  onChange={(e) => setReportForm({ ...reportForm, volunteerRemarks: e.target.value })}
                  placeholder="Verify physical documents, fee receipt authenticity, and academic record..."
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveAppForAudit(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingId === activeAppForAudit.id}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submittingId === activeAppForAudit.id ? 'Submitting...' : 'Forward to Trustees'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ChangePasswordModal
        isOpen={isPwdModalOpen}
        onClose={() => setIsPwdModalOpen(false)}
      />
    </div>
  );
}