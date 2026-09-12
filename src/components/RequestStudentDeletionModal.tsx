'use client';
import React, { useState } from 'react';

interface Props {
  student: { id: string; fullName: string; phone: string };
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestStudentDeletionModal({ student, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please state the specific reason for requesting this deletion.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/student-deletion/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, reason }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        onSuccess();
        onClose();
      } else {
        alert(data.error || 'Failed to submit deletion request.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              Volunteer Action Required
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">Request Student Deletion</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/60 text-xs text-amber-900">
            <p><strong>Candidate:</strong> {student.fullName} ({student.phone})</p>
            <p className="mt-1 text-[11px] text-amber-800">
              ⚠️ In accordance with Trust policy, student records are not immediately deleted. This request will be submitted to <strong>Admin Zaid Ahmed</strong> for final review and approval.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Deletion Request <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Duplicate registration, candidate withdrew application, fake documents submitted during in-person verification..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 font-bold text-xs rounded-xl text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Deletion Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}