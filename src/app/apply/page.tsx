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
  // Mandatory Documents
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
    marksCardUrl: '',
    incomeCertUrl: '',
    feeDemandUrl: '',
    idProofUrl: '',
    rationCardUrl: '',
    studentPhotoUrl: '',
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [missingErrors, setMissingErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cloudinary Direct Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docKey: keyof FormData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10 MB limit. Please upload a smaller file.');
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
        setMissingErrors((prev) => prev.filter((err) => !err.toLowerCase().includes(docKey.toLowerCase())));
      } else {
        alert('Upload failed: ' + (resData.error?.message || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error uploading document: ' + err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  // Validation function for mandatory (*) questions and documents
  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Academic & Financial Questions
    if (!formData.collegeName.trim()) errors.push('College / Institution Name is required.');
    if (!formData.courseName.trim()) errors.push('Course / Degree Name is required.');
    if (!formData.currentYearOfStudy.trim()) errors.push('Current Year of Study is required.');
    if (!formData.householdCategory.trim()) errors.push('Household Category is required.');

    const marks = Number(formData.previousScoreMarks);
    if (!formData.previousScoreMarks || isNaN(marks) || marks < 0 || marks > 100) {
      errors.push('Previous Academic Score (%) must be a valid number between 0 and 100.');
    }

    const income = Number(formData.familyAnnualIncome);
    if (!formData.familyAnnualIncome || isNaN(income) || income <= 0) {
      errors.push('Family Annual Income (₹) must be greater than 0.');
    }

    const fee = Number(formData.annualTuitionFee);
    if (!formData.annualTuitionFee || isNaN(fee) || fee <= 0) {
      errors.push('Annual College Tuition Fee (₹) must be greater than 0.');
    }

    // Mandatory Document Uploads
    if (!formData.marksCardUrl) {
      errors.push('Mandatory Document Missing: Previous Year Marks Card / Grade Sheet (*)');
    }
    if (!formData.incomeCertUrl) {
      errors.push('Mandatory Document Missing: Income Certificate / Salary Slip (*)');
    }
    if (!formData.feeDemandUrl) {
      errors.push('Mandatory Document Missing: College Fee Demand Note (*)');
    }
    if (!formData.idProofUrl) {
      errors.push('Mandatory Document Missing: Student Aadhar Card / ID Proof (*)');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validateForm();
    if (errors.length > 0) {
      setMissingErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setMissingErrors([]);
    setSubmitting(true);

    try {
      const res = await fetch('/api/student/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Application submitted successfully! Your Reference ID is: ${data.referenceNumber}`);
        router.push('/student/dashboard');
      } else {
        setSubmitError(data.error || 'Failed to submit application.');
        if (data.missingFields) {
          setMissingErrors(data.missingFields);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 py-8">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Udaan Scholarship Application Form
          </span>
          <h1 className="text-2xl font-black mt-2">Scholarship Application & Document Dossier</h1>
          <p className="text-xs text-slate-300 mt-1">
            Fields and documents marked with an asterisk (<span className="text-rose-400 font-bold text-sm">*</span>) are mandatory.
          </p>
        </div>

        {/* Missing Fields & Documents Warning Banner */}
        {missingErrors.length > 0 && (
          <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl shadow-sm text-rose-900 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <h3 className="text-sm font-black tracking-wide">
                Please complete all mandatory questions and upload required documents ({missingErrors.length} remaining):
              </h3>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs font-semibold pl-2">
              {missingErrors.map((err, idx) => (
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
          
          {/* Academic Details */}
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
                  placeholder="e.g. M.S. Ramaiah Institute of Technology"
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
                  Previous Academic Score (%) <span className="text-rose-500 font-black text-sm">*</span>
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

          {/* Financial Demographics */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Financial Demographics & Fee Requirement
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
                  Annual Tuition Fee (₹) <span className="text-rose-500 font-black text-sm">*</span>
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

          {/* Document Uploads */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              3. Mandatory Document Uploads
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Marks Card */}
              <div className={`p-4 rounded-2xl border ${formData.marksCardUrl ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Previous Year Marks Card <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.marksCardUrl ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">✓ Uploaded</span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Required *</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, 'marksCardUrl')}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                />
                {uploadingDoc === 'marksCardUrl' && <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading...</p>}
              </div>

              {/* Income Cert */}
              <div className={`p-4 rounded-2xl border ${formData.incomeCertUrl ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Income Certificate / Slip <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.incomeCertUrl ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">✓ Uploaded</span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Required *</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, 'incomeCertUrl')}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                />
                {uploadingDoc === 'incomeCertUrl' && <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading...</p>}
              </div>

              {/* Fee Demand Note */}
              <div className={`p-4 rounded-2xl border ${formData.feeDemandUrl ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    College Fee Demand Note <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.feeDemandUrl ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">✓ Uploaded</span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Required *</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, 'feeDemandUrl')}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                />
                {uploadingDoc === 'feeDemandUrl' && <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading...</p>}
              </div>

              {/* ID Proof */}
              <div className={`p-4 rounded-2xl border ${formData.idProofUrl ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Student ID / Aadhar Proof <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.idProofUrl ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">✓ Uploaded</span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Required *</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, 'idProofUrl')}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                />
                {uploadingDoc === 'idProofUrl' && <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading...</p>}
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 rounded-3xl shadow-lg text-white">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Declaration</h4>
              <p className="text-[11px] text-slate-300">I certify all details and uploaded documents are accurate.</p>
            </div>
            <button
              type="submit"
              disabled={submitting || uploadingDoc !== null}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Submitting Application...' : 'Submit Application Dossier'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}