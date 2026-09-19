'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  collegeName: string;
  courseName: string;
  currentYearOfStudy: string;
  previousScoreMarks: string;
  familyAnnualIncome: string;
  annualTuitionFee: string;
  householdCategory: string;
  residentialAddress: string;
  personalStatement: string;
  marksCardUrl: string;
  incomeCertUrl: string;
  feeDemandUrl: string;
  idProofUrl: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    collegeName: '',
    courseName: '',
    currentYearOfStudy: '',
    previousScoreMarks: '',
    familyAnnualIncome: '',
    annualTuitionFee: '',
    householdCategory: '',
    residentialAddress: '',
    personalStatement: '',
    marksCardUrl: '',
    incomeCertUrl: '',
    feeDemandUrl: '',
    idProofUrl: '',
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docKey: keyof FormData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10 MB limit.');
      return;
    }

    setUploadingDoc(docKey);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'ml_default');

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'yzeksrvb';
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: data,
      });

      const resData = await res.json();
      if (resData.secure_url) {
        setFormData((prev) => ({ ...prev, [docKey]: resData.secure_url }));
      } else {
        alert('Upload failed: ' + (resData.error?.message || 'Error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  const getMissingDocs = () => {
    const missing: string[] = [];
    if (!formData.marksCardUrl) missing.push('Previous Year Marks Card (*)');
    if (!formData.incomeCertUrl) missing.push('Income Certificate / Salary Slip (*)');
    if (!formData.feeDemandUrl) missing.push('College Fee Demand Note (*)');
    if (!formData.idProofUrl) missing.push('Student ID / Aadhar Proof (*)');
    return missing;
  };

  const missingDocs = getMissingDocs();
  const isComplete = missingDocs.length === 0;

  const handleAttemptSubmit = (e: React.MouseEvent) => {
    if (!isComplete) {
      e.preventDefault();
      e.stopPropagation();
      setShowWarning(true);
      alert(`⚠️ SUBMISSION BLOCKED!\n\nYou must upload all 4 mandatory documents before submitting:\n\n• ${missingDocs.join('\n• ')}`);
      document.getElementById('doc-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      setShowWarning(true);
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/student/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Application registered! Ref: ${data.referenceNumber}`);
        router.push('/student/dashboard');
      } else {
        setServerError(data.error || 'Failed to submit application.');
        setShowWarning(true);
      }
    } catch (err: any) {
      setServerError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 py-8">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded">
            Udaan Scholarship Portal
          </span>
          <h1 className="text-2xl font-black mt-2">Scholarship Application & Document Dossier</h1>
          <p className="text-xs text-slate-300 mt-1">
            All 4 document uploads marked with an asterisk (<span className="text-rose-400 font-bold">*</span>) are mandatory. The form cannot be submitted without them.
          </p>
        </div>

        {(showWarning || missingDocs.length > 0) && (
          <div className="p-5 bg-rose-50 border-2 border-rose-400 rounded-3xl text-rose-900 space-y-2">
            <h3 className="text-sm font-black flex items-center gap-2">
              <span>⚠️</span> Mandatory Document Uploads Required ({missingDocs.length} Missing)
            </h3>
            <p className="text-xs font-semibold">
              You must upload the following files before the application can be submitted:
            </p>
            <ul className="list-disc list-inside text-xs font-bold pl-2 space-y-1 text-rose-800">
              {missingDocs.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {serverError && (
          <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-xs font-bold text-rose-900">
            ❌ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">1. Academic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">College Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MSRUAS"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree & Course *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Year *</label>
                <select
                  required
                  value={formData.currentYearOfStudy}
                  onChange={(e) => setFormData({ ...formData, currentYearOfStudy: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Previous Score Marks (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.previousScoreMarks}
                  onChange={(e) => setFormData({ ...formData, previousScoreMarks: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">2. Financials & Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Annual Family Income (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.familyAnnualIncome}
                  onChange={(e) => setFormData({ ...formData, familyAnnualIncome: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Annual Tuition Fee (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.annualTuitionFee}
                  onChange={(e) => setFormData({ ...formData, annualTuitionFee: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Household Category *</label>
                <select
                  required
                  value={formData.householdCategory}
                  onChange={(e) => setFormData({ ...formData, householdCategory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="">Select Category</option>
                  <option value="Single Parent / Orphan">Single Parent / Orphan</option>
                  <option value="BPL / Low Income">BPL / Low Income</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            <div className="space-y-3 text-xs pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Residential Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.residentialAddress}
                  onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Personal Statement *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.personalStatement}
                  onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          <div id="doc-section" className="bg-white p-6 rounded-3xl border-2 border-amber-300 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              3. Mandatory Document Dossier Uploads (*)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'marksCardUrl', label: 'Previous Year Marks Card *' },
                { key: 'incomeCertUrl', label: 'Income Certificate / Salary Slip *' },
                { key: 'feeDemandUrl', label: 'College Fee Demand Note *' },
                { key: 'idProofUrl', label: 'Student ID / Aadhar Card *' },
              ].map((doc) => {
                const isUploaded = !!formData[doc.key as keyof FormData];
                return (
                  <div
                    key={doc.key}
                    className={`p-4 rounded-2xl border-2 transition ${
                      isUploaded ? 'border-emerald-400 bg-emerald-50/50' : 'border-rose-300 bg-rose-50/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-900">{doc.label}</span>
                      {isUploaded ? (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          ✓ Attached
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                          Upload Required *
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileUpload(e, doc.key as keyof FormData)}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                    />
                    {uploadingDoc === doc.key && <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading...</p>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-3xl shadow-lg text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-black uppercase text-amber-400">Submission Desk</h4>
              <p className="text-[11px] text-slate-300">
                {!isComplete ? `⚠️ Upload all 4 mandatory files (${missingDocs.length} remaining)` : '✓ All 4 documents attached'}
              </p>
            </div>
            <button
              type="submit"
              onClick={handleAttemptSubmit}
              disabled={submitting || uploadingDoc !== null}
              className={`w-full sm:w-auto px-8 py-3.5 font-black text-xs rounded-2xl shadow transition cursor-pointer ${
                isComplete
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {submitting ? 'Registering Dossier...' : isComplete ? 'Submit Application Dossier' : 'Upload Documents to Submit'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}