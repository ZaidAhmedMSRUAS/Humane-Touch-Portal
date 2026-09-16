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
  const [missingDocsWarning, setMissingDocsWarning] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Internal Server-Side Upload (No invalid client cloud name)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docKey: keyof FormData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10 MB limit. Please choose a smaller file.');
      return;
    }

    setUploadingDoc(docKey);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const resData = await res.json();
      if (res.ok && resData.secure_url) {
        setFormData((prev) => ({ ...prev, [docKey]: resData.secure_url }));
        setMissingDocsWarning((prev) =>
          prev.filter((item) => !item.toLowerCase().includes(docKey.toLowerCase()))
        );
      } else {
        alert('Upload failed: ' + (resData.error || 'Server error during upload'));
      }
    } catch (err: any) {
      alert('Upload network error: ' + err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  const getMissingDocuments = (): string[] => {
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

  const missingDocs = getMissingDocuments();
  const allDocsUploaded = missingDocs.length === 0;

  const handleAttemptSubmit = (e: React.MouseEvent) => {
    if (!allDocsUploaded) {
      e.preventDefault();
      e.stopPropagation();
      setMissingDocsWarning(missingDocs);
      alert(
        `⚠️ SUBMISSION BLOCKED!\n\nYou cannot submit your application until all 4 mandatory documents are uploaded:\n\n• ${missingDocs.join('\n• ')}`
      );
      document.getElementById('mandatory-documents-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allDocsUploaded) {
      setMissingDocsWarning(missingDocs);
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/applications', {
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
        }
      }
    } catch (err: any) {
      setServerError(err.message || 'Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 py-8">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Udaan Scholarship Portal
          </span>
          <h1 className="text-2xl font-black mt-2">Scholarship Application & Document Dossier</h1>
          <p className="text-xs text-slate-300 mt-1">
            Questions and document uploads marked with an asterisk (<span className="text-rose-400 font-bold">*</span>) are mandatory. The form is strictly locked until all required documents are uploaded.
          </p>
        </div>

        {/* Warning Banner */}
        {missingDocsWarning.length > 0 && (
          <div className="p-5 bg-rose-50 border-2 border-rose-400 rounded-3xl shadow-sm text-rose-900 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <h3 className="text-sm font-black tracking-wide">
                Submission Blocked: {missingDocsWarning.length} Mandatory Document(s) Missing
              </h3>
            </div>
            <p className="text-xs text-rose-700 font-semibold">
              Please attach all required files below before submitting:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs font-bold pl-2 text-rose-800">
              {missingDocsWarning.map((doc, idx) => (
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
          
          {/* Section 1: Academic Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              1. Academic & Institution Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  College / University Name <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.S. Ramaiah University of Applied Sciences"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Degree & Course Name <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Computer Science / MBBS"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Current Year of Study <span className="text-rose-500 font-black">*</span>
                </label>
                <select
                  required
                  value={formData.currentYearOfStudy}
                  onChange={(e) => setFormData({ ...formData, currentYearOfStudy: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
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
                  Previous Academic Marks (%) <span className="text-rose-500 font-black">*</span>
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Residential Address & Need Statement */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              2. Residential Address & Need Statement
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Permanent Residential Address <span className="text-rose-500 font-black">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House/Flat No., Street, Area, City, State, PIN Code"
                  value={formData.residentialAddress}
                  onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Personal Statement / Need Description <span className="text-rose-500 font-black">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe your family background, financial situation, and academic goals..."
                  value={formData.personalStatement}
                  onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Demographics */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              3. Financial Demographics & Tuition Fee
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Family Annual Income (₹) <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 120000"
                  value={formData.familyAnnualIncome}
                  onChange={(e) => setFormData({ ...formData, familyAnnualIncome: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Annual College Tuition Fee (₹) <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 65000"
                  value={formData.annualTuitionFee}
                  onChange={(e) => setFormData({ ...formData, annualTuitionFee: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Household Category <span className="text-rose-500 font-black">*</span>
                </label>
                <select
                  required
                  value={formData.householdCategory}
                  onChange={(e) => setFormData({ ...formData, householdCategory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
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
            className="bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-sm space-y-4"
          >
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                4. Mandatory Document Dossier Uploads
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All 4 documents below are strictly mandatory (<span className="text-rose-500 font-bold">*</span>). Max 10 MB each (PDF, JPG, PNG).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'marksCardUrl', label: 'Previous Year Marks Card / Grade Sheet *' },
                { key: 'incomeCertUrl', label: 'Income Certificate / Salary Slip *' },
                { key: 'feeDemandUrl', label: 'College Fee Demand Note / Structure *' },
                { key: 'idProofUrl', label: 'Student Aadhar Card / Govt ID Proof *' },
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
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                          ✓ Attached
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300">
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
                    {uploadingDoc === doc.key && (
                      <p className="text-[10px] text-amber-600 font-bold mt-1 animate-pulse">
                        Uploading to server...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission Bar */}
          <div className="p-6 bg-slate-900 rounded-3xl shadow-lg text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Submission Desk</h4>
              <p className="text-[11px] text-slate-300">
                {!allDocsUploaded
                  ? `⚠️ ${missingDocs.length} document(s) remaining before submission is unlocked.`
                  : '✓ All 4 mandatory documents attached. Ready to submit.'}
              </p>
            </div>
            <button
              type="submit"
              onClick={handleAttemptSubmit}
              disabled={submitting || uploadingDoc !== null}
              className={`w-full sm:w-auto px-8 py-3.5 font-black text-xs rounded-2xl shadow transition cursor-pointer ${
                allDocsUploaded
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {submitting
                ? 'Registering Dossier...'
                : allDocsUploaded
                ? 'Submit Application Dossier'
                : 'Upload Documents to Submit'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}