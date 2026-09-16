'use client';
import React, { useState } from 'react';

interface Props {
  app: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditApplicationModal({ app, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    collegeName: app.collegeName || '',
    courseName: app.courseName || '',
    currentYearOfStudy: app.currentYearOfStudy || '1st Year',
    previousScoreMarks: String(app.previousScoreMarks || ''),
    familyAnnualIncome: String(app.familyAnnualIncome || ''),
    annualTuitionFee: String(app.annualTuitionFee || ''),
    householdCategory: app.householdCategory || 'General Category',
    chequeInFavourOf: app.chequeInFavourOf || '',
    residentialAddress: app.residentialAddress || '',
    personalStatement: app.personalStatement || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_APPLICATION',
          applicationId: app.id,
          ...formData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Application updated successfully!');
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to update application');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
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
              Admin Override
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              ✏️ Edit Student Application: {app.student?.fullName || app.studentName}
            </h3>
            <p className="text-xs font-mono font-bold text-amber-800">{app.referenceNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Course & College */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Degree / Course Name *</label>
              <input
                type="text"
                required
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">College / Institution Name *</label>
              <input
                type="text"
                required
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Row 2: Year & Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Year of Study *</label>
              <select
                value={formData.currentYearOfStudy}
                onChange={(e) => setFormData({ ...formData, currentYearOfStudy: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year / Final Year">5th Year / Final Year</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Previous Academic Marks (%) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={formData.previousScoreMarks}
                onChange={(e) => setFormData({ ...formData, previousScoreMarks: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Row 3: Income, Tuition Fee & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Family Annual Income (₹) *</label>
              <input
                type="number"
                required
                value={formData.familyAnnualIncome}
                onChange={(e) => setFormData({ ...formData, familyAnnualIncome: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Annual Tuition Fee (₹) *</label>
              <input
                type="number"
                required
                value={formData.annualTuitionFee}
                onChange={(e) => setFormData({ ...formData, annualTuitionFee: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Household Category *</label>
              <select
                value={formData.householdCategory}
                onChange={(e) => setFormData({ ...formData, householdCategory: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Single Parent / Orphan">Single Parent / Orphan</option>
                <option value="BPL / Low Income Household">BPL / Low Income Household</option>
                <option value="Minority / Backward Class">Minority / Backward Class</option>
                <option value="General Category">General Category</option>
              </select>
            </div>
          </div>

          {/* Cheque In Favour Of */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Cheque In Favour Of (Payee)</label>
            <input
              type="text"
              placeholder="e.g. M.S. Ramaiah Institute of Technology"
              value={formData.chequeInFavourOf}
              onChange={(e) => setFormData({ ...formData, chequeInFavourOf: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Residential Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
            <textarea
              rows={2}
              value={formData.residentialAddress}
              onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Personal Statement */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Personal Statement</label>
            <textarea
              rows={3}
              value={formData.personalStatement}
              onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
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
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}