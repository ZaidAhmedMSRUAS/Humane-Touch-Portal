'use client';
import React, { useState } from 'react';

interface Props {
  app: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VolunteerVerificationModal({ app, onClose, onSuccess }: Props) {
  const [chequeInFavourOf, setChequeInFavourOf] = useState(
    app.chequeInFavourOf || app.collegeName || ''
  );
  const [volunteerRemarks, setVolunteerRemarks] = useState(
    app.verificationReport?.volunteerRemarks || ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chequeInFavourOf.trim()) {
      setError('Please specify the official "Cheque In Favour Of" college payee name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/volunteer/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          chequeInFavourOf: chequeInFavourOf.trim(),
          volunteerRemarks: volunteerRemarks.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Verification complete & Cheque Payee saved successfully!');
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to submit verification.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Assigned Field Verification
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Document Verification & Payee: {app.student?.fullName || app.studentName}
            </h3>
            <p className="text-xs font-mono font-bold text-amber-800">{app.referenceNumber}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 cursor-pointer">âœ•</button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">
            {error}
          </div>
        )}

        {/* Student Dossier Information */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 text-[10px] block">Student Mobile</span>
            <span className="font-mono font-bold text-slate-900">{app.student?.phone || app.studentPhone}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Course & Year</span>
            <span className="font-bold text-slate-900">{app.courseName} ({app.currentYearOfStudy})</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Academic Marks</span>
            <span className="font-bold text-amber-800">{app.previousScoreMarks}%</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Annual Tuition Fee</span>
            <span className="font-mono font-bold text-emerald-800">â‚¹{app.annualTuitionFee?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Address & Need Statement */}
        <div className="space-y-2 text-xs">
          {app.residentialAddress && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">Permanent Address:</strong>
              <p className="text-slate-600">{app.residentialAddress}</p>
            </div>
          )}
          {app.personalStatement && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">Student Statement / Financial Need:</strong>
              <p className="text-slate-600">{app.personalStatement}</p>
            </div>
          )}
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-2 border-t border-slate-100">
          <div>
            <label className="block font-black text-slate-900 mb-1">
              Cheque In Favour Of (College / University Payee Name) <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Confirm the exact institutional payee name from the fee demand note or college bank details.
            </p>
            <input
              type="text"
              required
              placeholder="e.g. M.S. Ramaiah University of Applied Sciences"
              value={chequeInFavourOf}
              onChange={(e) => setChequeInFavourOf(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Volunteer Comments Field */}
          <div>
            <label className="block font-black text-slate-900 mb-1">
              Volunteer Verification Comments / Field Observations
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Record physical document scrutiny observations, original fee receipts checked, and family situation assessment for the Trustees.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Verified original 12th marks card, income certificate, and fee demand note in person. Family situation is genuine."
              value={volunteerRemarks}
              onChange={(e) => setVolunteerRemarks(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'âœ“ Complete Verification & Save Comments'}
            </button>
          </div>
        </form>

      </div>
    </div>

        {/* Uploaded Documents Scrutiny Grid */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
          <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
            Uploaded Scrutiny Documents:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {app.sslcMarksCardUrl && (
              <a
                href={app.sslcMarksCardUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white rounded-xl border border-amber-300 font-bold text-amber-900 hover:bg-amber-50 flex items-center justify-between"
              >
                <span>📜 SSLC Marks Card</span>
                <span>↗</span>
              </a>
            )}
            {app.pucMarksCardUrl && (
              <a
                href={app.pucMarksCardUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white rounded-xl border border-amber-300 font-bold text-amber-900 hover:bg-amber-50 flex items-center justify-between"
              >
                <span>📜 PUC Marks Card</span>
                <span>↗</span>
              </a>
            )}
            {app.marksCardUrl && (
              <a
                href={app.marksCardUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>📄 Previous Marks</span>
                <span>↗</span>
              </a>
            )}
            {app.incomeCertUrl && (
              <a
                href={app.incomeCertUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>💰 Income Certificate</span>
                <span>↗</span>
              </a>
            )}
            {app.feeDemandUrl && (
              <a
                href={app.feeDemandUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>🧾 Fee Demand Note</span>
                <span>↗</span>
              </a>
            )}
            {app.idProofUrl && (
              <a
                href={app.idProofUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>🪪 ID / Aadhar Proof</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </div>
  );
}