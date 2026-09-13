'use client';
import React, { useState } from 'react';

interface Props {
  app: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TrusteeInterviewModal({ app, onClose, onSuccess }: Props) {
  const [trusteeName, setTrusteeName] = useState('Tazaiyun Oomer');
  const [interviewScore, setInterviewScore] = useState('85');
  const [sanctionedAmount, setSanctionedAmount] = useState(
    String(app.sanctionedAmount || app.annualTuitionFee || 50000)
  );
  const [interviewNotes, setInterviewNotes] = useState(
    'Candidate verified in person. Demonstrated strong academic dedication and genuine financial need. Recommended for full tuition grant.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
    if (decision === 'APPROVE' && (!sanctionedAmount || Number(sanctionedAmount) <= 0)) {
      setError('Please enter a valid sanctioned grant amount.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/trustee/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          decision,
          trusteeName,
          interviewScore,
          interviewNotes,
          sanctionedAmount: Number(sanctionedAmount),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to submit interview assessment.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-6">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Trustee Board Evaluation
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              🎙️ Conduct In-Person Interview
            </h3>
            <p className="text-xs font-mono font-bold text-amber-800">{app.referenceNumber}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 cursor-pointer">✕</button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">
            {error}
          </div>
        )}

        {/* Candidate Dossier Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 text-[10px] block">Student Name</span>
            <span className="font-bold text-slate-900">{app.student?.fullName || app.studentName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Course & College</span>
            <span className="font-bold text-slate-900">{app.courseName} - {app.collegeName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Academic Score</span>
            <span className="font-bold text-amber-800">{app.previousScoreMarks}% Marks</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Tuition Fee</span>
            <span className="font-mono font-bold text-emerald-800">₹{app.annualTuitionFee?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Volunteer Cheque In Favour Of Status */}
        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs flex justify-between items-center">
          <div>
            <span className="font-bold text-amber-900">Cheque In Favour Of (Verified by Volunteer):</span>
            <p className="text-slate-800 font-semibold">{app.chequeInFavourOf || 'Pending Volunteer Entry'}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-amber-300 rounded text-amber-800">
            {app.status}
          </span>
        </div>

        {/* In-Person Interview Evaluation Form */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Presiding Trustee <span className="text-rose-500">*</span>
              </label>
              <select
                value={trusteeName}
                onChange={(e) => setTrusteeName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Tazaiyun Oomer">Tazaiyun Oomer (Secretary & Trustee)</option>
                <option value="Nazia Masood">Nazia Masood (Trustee)</option>
                <option value="Zaiba Abdulla">Zaiba Abdulla (Trustee)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Interview Performance Score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={interviewScore}
                onChange={(e) => setInterviewScore(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Sanctioned Grant Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 50000"
              value={sanctionedAmount}
              onChange={(e) => setSanctionedAmount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500 text-emerald-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Trustee Interview Assessment & Observations
            </label>
            <textarea
              rows={3}
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleDecision('REJECT')}
            disabled={submitting}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs cursor-pointer"
          >
            Reject Candidate
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDecision('APPROVE')}
              disabled={submitting}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Recording...' : '✓ Complete Interview & Sanction Grant'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}