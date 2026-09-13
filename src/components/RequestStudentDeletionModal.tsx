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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a specific reason for deletion.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/volunteer/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          studentName: student.fullName,
          studentPhone: student.phone,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Deletion request submitted successfully for ${student.fullName}. Awaiting Admin Zaid Ahmed's approval.`);
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>🗑️</span> Request Student Deletion
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-600">✕</button>
        </div>

        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
          <p><strong>Student:</strong> {student.fullName}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p className="text-[11px] text-rose-700 mt-1">
            This request will be routed to Admin Zaid Ahmed for permanent database purging.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-xs font-bold text-rose-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Reason for Deletion Request <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Duplicate test application, student opted out, invalid contact details..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit to Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}