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
  // Mandatory Document URLs (*)
  marksCardUrl: string;
  incomeCertUrl: string;
  feeDemandUrl: string;
  idProofUrl: string;
  // Optional
  rationCardUrl: string;
  studentPhotoUrl: string;
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
    rationCardUrl: '',
    studentPhotoUrl: '',
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cloudinary Direct Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docKey: keyof FormData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10 MB limit. Please upload a smaller PDF or image.');
      return;
    }

    setUploadingDoc(docKey);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'ml_default');

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'yyzeksrvb';
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: data,
      });

      const resData = await res.json();
      if (resData.secure_url) {
        setFormData((prev) => ({ ...prev, [docKey]: resData.secure_url }));
        setValidationErrors((prev) => prev.filter((err) => !err.toLowerCase().includes(docKey.toLowerCase())));
      } else {
        alert('Upload failed: ' + (resData.error?.message || 'Upload rejected'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  // Strict Document & Question Validation
  const validateForm = (): string[] => {
    const errors: string[] = [];

    // 1. Mandatory Text Fields
    if (!formData.collegeName.trim()) errors.push('College / University Name is required (*)');
    if (!formData.courseName.trim()) errors.push('Degree / Course Name is required (*)');
    if (!formData.currentYearOfStudy.trim()) errors.push('Current Year of Study is required (*)');
    if (!formData.householdCategory.trim()) errors.push('Household Category is required (*)');
    if (!formData.residentialAddress.trim()) errors.push('Permanent Residential Address is required (*)');
    if (!formData.personalStatement.trim()) errors.push('Personal Statement / Need Description is required (*)');

    const marks = Number(formData.previousScoreMarks);
    if (!formData.previousScoreMarks || isNaN(marks) || marks < 0 || marks > 100) {
      errors.push('Previous Academic Marks (%) must be a valid number between 0 and 100 (*)');
    }

    const income = Number(formData.familyAnnualIncome);
    if (!formData.familyAnnualIncome || isNaN(income) || income <= 0) {
      errors.push('Family Annual Income (₹) must be greater than 0 (*)');
    }

    const fee = Number(formData.annualTuitionFee);
    if (!formData.annualTuitionFee || isNaN(fee) || fee <= 0) {
      errors.push('Annual College Tuition Fee (₹) must be greater than 0 (*)');
    }

    // 2. Strict Mandatory Document Checks (*)
    if (!formData.marksCardUrl || formData.marksCardUrl.trim() === '') {
      errors.push('Marks Card / Grade Sheet (*) is required.');
    }
    if (!formData.incomeCertUrl || formData.incomeCertUrl.trim() === '') {
      errors.push('Income Certificate / Salary Slip (*) is required.');
    }
    if (!formData.feeDemandUrl || formData.feeDemandUrl.trim() === '') {
      errors.push('College Fee Demand Note / Structure (*) is required.');
    }
    if (!formData.idProofUrl || formData.idProofUrl.trim() === '') {
      errors.push('Student Aadhar Card / Govt ID Proof (*) is required.');
    }

    return errors;
  };

  const allMandatoryDocsUploaded =
    Boolean(formData.marksCardUrl) &&
    Boolean(formData.incomeCertUrl) &&
    Boolean(formData.feeDemandUrl) &&
    Boolean(formData.idProofUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setSubmitError(null);

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);
    setSubmitting(true);

    try {
      const res = await fetch('/api/student/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Application registered successfully! Reference ID: ${data.referenceNumber}`);
        router.push('/student/dashboard');
      } else {
        setSubmitError(data.error || 'Failed to submit application.');
        if (data.missingFields) {
          setValidationErrors(data.missingFields);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 py-8">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Udaan Scholarship Application Form
          </span>
          <h1 className="text-2xl font-black mt-2">Scholarship Application & Document Dossier</h1>
          <p className="text-xs text-slate-300 mt-1">
            Questions and document uploads marked with an asterisk (<span className="text-rose-400 font-bold text-sm">*</span>) are mandatory. The portal will block submission until all 4 required documents are uploaded.
          </p>
        </div>

        {/* Warning Banner */}
        {validationErrors.length > 0 && (
          <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl shadow-sm text-rose-900 space-y-3 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <h3 className="text-sm font-black tracking-wide">
                Submission Blocked: {validationErrors.length} mandatory requirement(s) missing
              </h3>
            </div>
            <p className="text-xs text-rose-700">
              You must upload all 4 required documents marked with an asterisk (*) before submitting your dossier:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs font-semibold pl-2">
              {validationErrors.map((err, idx) => (
                <li key={idx} className="text-rose-800">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-xs font-bold text-rose-900">
            ❌ {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Academic Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Academic & Institution Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  College / University Name <span className="text-rose-500 font-black text-sm">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.S. Ramaiah University of Applied Sciences"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Degree & Course Name <span className="text-rose-500 font-black text-sm">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Computer Science / MBBS"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Current Year of Study <span className="text-rose-500 font-black text-sm">*</span>
                </label>
                <select
                  required
                  value={formData.currentYearOfStudy}
                  onChange={(e) => setFormData({ ...formData, currentYearOfStudy: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year / Final Year">5th Year / Final Year</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Previous Academic Marks (%) <span className="text-rose-500 font-black text-sm">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 84.5"
                  value={formData.previousScoreMarks}
                  onChange={(e) => setFormData({ ...formData, previousScoreMarks: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Personal Statement */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Residential Address & Personal Statement
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Permanent Residential Address <span className="text-rose-500 font-black text-sm">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House/Flat No., Street, Area, City, State, PIN Code"
                  value={formData.residentialAddress}
                  onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Personal Statement / Need for Scholarship Support <span className="text-rose-500 font-black text-sm">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your family background, financial hardship, and career goals..."
                  value={formData.personalStatement}
                  onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financials */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              3. Financial Demographics & Fee Structure
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Family Annual Income (₹) <span className="text-rose-500 font-black text-sm">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 120000"
                  value={formData.familyAnnualIncome}
                  onChange={(e) => setFormData({ ...formData, familyAnnualIncome: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Annual College Tuition Fee (₹) <span className="text-rose-500 font-black text-sm">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 65000"
                  value={formData.annualTuitionFee}
                  onChange={(e) => setFormData({ ...formData, annualTuitionFee: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Household Category <span className="text-rose-500 font-black text-sm">*</span>
                </label>
                <select
                  required
                  value={formData.householdCategory}
                  onChange={(e) => setFormData({ ...formData, householdCategory: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="">Select Category</option>
                  <option value="Single Parent / Orphan">Single Parent / Orphan</option>
                  <option value="BPL / Low Income Household">BPL / Low Income Household</option>
                  <option value="Minority / Backward Class">Minority / Backward Class</option>
                  <option value="General Category">General Category</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Mandatory Document Dossier Uploads (*) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                4. Mandatory Document Dossier Uploads
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All 4 documents below are strictly mandatory (*). PDF, JPG, or PNG (Max 10 MB each).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document 1: Marks Card */}
              <div
                className={`p-4 rounded-2xl border-2 transition ${
                  formData.marksCardUrl
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : hasAttemptedSubmit
                    ? 'border-rose-400 bg-rose-50/40'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Previous Year Marks Card <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.marksCardUrl ? (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                      ✓ Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300">
                      Upload Required *
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, 'marksCardUrl')}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                />
                {uploadingDoc === 'marksCardUrl' && <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading document...</p>}
              </div>

              {/* Document 2: Income Certificate */}
              <div
                className={`p-4 rounded-2xl border-2 transition ${
                  formData.incomeCertUrl
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : hasAttemptedSubmit
                    ? 'border-rose-400 bg-rose-50/40'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Income Certificate / Slip <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.incomeCertUrl ? (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                      ✓ Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300">
                      Upload Required *
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, 'incomeCertUrl')}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                />
                {uploadingDoc === 'incomeCertUrl' && <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading document...</p>}
              </div>

              {/* Document 3: Fee Demand */}
              <div
                className={`p-4 rounded-2xl border-2 transition ${
                  formData.feeDemandUrl
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : hasAttemptedSubmit
                    ? 'border-rose-400 bg-rose-50/40'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    College Fee Demand Note <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.feeDemandUrl ? (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                      ✓ Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300">
                      Upload Required *
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, 'feeDemandUrl')}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                />
                {uploadingDoc === 'feeDemandUrl' && <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading document...</p>}
              </div>

              {/* Document 4: ID Proof */}
              <div
                className={`p-4 rounded-2xl border-2 transition ${
                  formData.idProofUrl
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : hasAttemptedSubmit
                    ? 'border-rose-400 bg-rose-50/40'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Student ID / Aadhar Proof <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.idProofUrl ? (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                      ✓ Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300">
                      Upload Required *
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, 'idProofUrl')}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                />
                {uploadingDoc === 'idProofUrl' && <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading document...</p>}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 rounded-3xl shadow-lg text-white">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Final Verification & Submission</h4>
              <p className="text-[11px] text-slate-300">
                {allMandatoryDocsUploaded
                  ? '✓ All 4 mandatory documents uploaded. You may submit.'
                  : '⚠️ All 4 mandatory documents must be uploaded before submitting.'}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting || uploadingDoc !== null || !allMandatoryDocsUploaded}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Registering Dossier...' : 'Submit Application Dossier'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}