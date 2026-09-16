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
  // 4 Mandatory Documents (*)
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
  const [missingDocsWarning, setMissingDocsWarning] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Cloudinary Direct Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docKey: keyof FormData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10 MB limit. Please upload a smaller file.');
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
        setMissingDocsWarning((prev) =>
          prev.filter((item) => !item.toLowerCase().includes(docKey.toLowerCase()))
        );
      } else {
        alert('Upload failed: ' + (resData.error?.message || 'Upload rejected'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  // Inspect Mandatory Document Uploads
  const checkMissingDocuments = (): string[] => {
    const missing: string[] = [];
    if (!formData.marksCardUrl || formData.marksCardUrl.trim() === '') {
      missing.push('Previous Year Marks Card / Grade Sheet (*)');
    }
    if (!formData.incomeCertUrl || formData.incomeCertUrl.trim() === '') {
      missing.push('Income Certificate / Salary Slip (*)');
    }
    if (!formData.feeDemandUrl || formData.feeDemandUrl.trim() === '') {
      missing.push('College Fee Demand Note / Structure (*)');
    }
    if (!formData.idProofUrl || formData.idProofUrl.trim() === '') {
      missing.push('Student Aadhar Card / Govt ID Proof (*)');
    }
    return missing;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // 1. Check for Missing Mandatory Documents
    const missing = checkMissingDocuments();
    if (missing.length > 0) {
      setMissingDocsWarning(missing);
      alert(
        `⚠️ SUBMISSION BLOCKED: You cannot submit your application until all mandatory documents are uploaded.\n\nMissing:\n• ${missing.join('\n• ')}`
      );
      document.getElementById('mandatory-documents-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // 2. Validate Academic & Demographic Fields
    if (
      !formData.collegeName.trim() ||
      !formData.courseName.trim() ||
      !formData.currentYearOfStudy.trim() ||
      !formData.residentialAddress.trim() ||
      !formData.personalStatement.trim() ||
      !formData.householdCategory.trim()
    ) {
      alert('⚠️ Please fill out all required academic and personal information fields marked with (*).');
      return;
    }

    setMissingDocsWarning([]);
    setSubmitting(true);

    try {
      const res = await fetch('/api/student/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Application registered successfully! Reference Number: ${data.referenceNumber}`);
        router.push('/student/dashboard');
      } else {
        setServerError(data.error || 'Failed to submit application.');
        if (data.missingDocuments) {
          setMissingDocsWarning(data.missingDocuments);
          document.getElementById('mandatory-documents-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err: any) {
      setServerError(err.message || 'Submission failed due to network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const missingDocs = checkMissingDocuments();
  const allDocsUploaded = missingDocs.length === 0;

  return (
    <div className="min-h-screen bg-slate-100/60 py-8">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Udaan Scholarship Portal
          </span>
          <h1 className="text-2xl font-black mt-2">Scholarship Application & Document Dossier</h1>
          <p className="text-xs text-slate-300 mt-1">
            Questions and document uploads marked with an asterisk (<span className="text-rose-400 font-bold text-sm">*</span>) are strictly mandatory. Applications cannot be submitted without all required documents.
          </p>
        </div>

        {/* TOP WARNING BANNER */}
        {missingDocsWarning.length > 0 && (
          <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl shadow-sm text-rose-900 space-y-2 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <h3 className="text-sm font-black tracking-wide">
                Submission Blocked: {missingDocsWarning.length} Mandatory Document(s) Missing
              </h3>
            </div>
            <p className="text-xs text-rose-700">
              You must upload the following files before your application can be registered:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs font-semibold pl-2">
              {missingDocsWarning.map((doc, idx) => (
                <li key={idx} className="text-rose-800">
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {serverError && (
          <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-xs font-bold text-rose-900">
            ❌ {serverError}
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

          {/* Section 2: Residential Address & Need Statement */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Residential Address & Need Statement
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
                  placeholder="Describe your family background, financial situation, and academic goals..."
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
          <div
            id="mandatory-documents-section"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                4. Mandatory Document Dossier Uploads
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All 4 documents below are strictly mandatory (<span className="text-rose-500 font-bold">*</span>). Max 10 MB per file (PDF, JPG, PNG).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Document 1: Marks Card */}
              <div
                className={`p-4 rounded-2xl border-2 transition ${
                  formData.marksCardUrl
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-rose-300 bg-rose-50/30'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Previous Year Marks Card <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.marksCardUrl ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      ✓ Attached
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300">
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
                {uploadingDoc === 'marksCardUrl' && (
                  <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading document...</p>
                )}
              </div>

              {/* Document 2: Income Certificate */}
              <div
                className={`p-4 rounded-2xl border-2 transition ${
                  formData.incomeCertUrl
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-rose-300 bg-rose-50/30'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Income Certificate / Slip <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.incomeCertUrl ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      ✓ Attached
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300">
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
                {uploadingDoc === 'incomeCertUrl' && (
                  <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading document...</p>
                )}
              </div>

              {/* Document 3: Fee Demand Note */}
              <div
                className={`p-4 rounded-2xl border-2 transition ${
                  formData.feeDemandUrl
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-rose-300 bg-rose-50/30'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    College Fee Demand Note <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.feeDemandUrl ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      ✓ Attached
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300">
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
                {uploadingDoc === 'feeDemandUrl' && (
                  <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading document...</p>
                )}
              </div>

              {/* Document 4: ID Proof */}
              <div
                className={`p-4 rounded-2xl border-2 transition ${
                  formData.idProofUrl
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-rose-300 bg-rose-50/30'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Student ID / Aadhar Proof <span className="text-rose-500 font-black text-sm">*</span>
                  </span>
                  {formData.idProofUrl ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      ✓ Attached
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300">
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
                {uploadingDoc === 'idProofUrl' && (
                  <p className="text-[10px] text-amber-600 font-bold mt-1">Uploading document...</p>
                )}
              </div>

            </div>
          </div>

          {/* Submission Bar with Live Document Guard */}
          <div className="p-6 bg-slate-900 rounded-3xl shadow-lg text-white space-y-4">
            
            {/* Live Upload Status Warning */}
            {!allDocsUploaded ? (
              <div className="p-3.5 bg-rose-500/20 border border-rose-500/50 rounded-2xl text-xs text-rose-200 flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <div>
                  <strong className="block text-white font-black">
                    Documents Missing ({missingDocs.length} remaining):
                  </strong>
                  <span>Upload all 4 asterisk-marked documents to unlock submission.</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
                <span className="text-base">✅</span>
                <span className="font-bold text-white">
                  All 4 mandatory documents attached. Ready for submission.
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-slate-400">
                Submitting creates your application reference ID and forwards your dossier for volunteer verification.
              </p>
              <button
                type="submit"
                disabled={submitting || uploadingDoc !== null}
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Registering Dossier...' : 'Submit Application Dossier'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}