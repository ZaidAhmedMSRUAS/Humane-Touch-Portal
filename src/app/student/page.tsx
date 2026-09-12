'use client';
import React, { useState, useEffect } from 'react';
import SanctionLetterPDF from '@/components/SanctionLetterPDF';
import CertificatePDF from '@/components/CertificatePDF';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export default function StudentPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  
  // Document Modals
  const [selectedLetterApp, setSelectedLetterApp] = useState<any | null>(null);
  const [selectedCertApp, setSelectedCertApp] = useState<any | null>(null);
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);

  // Form Fields
  const [form, setForm] = useState({
    collegeName: '',
    courseName: '',
    currentYearOfStudy: '1st Year',
    previousScoreMarks: '',
    annualTuitionFee: '',
    familyAnnualIncome: '',
    householdCategory: 'General / EWS',
    residentialAddress: '',
    personalStatement: '',
    docStudentAadhaar: '',
    docParentAadhaar: '',
    docIncomeCaste: '',
    docMarksCards: '',
    docFeeDemandNote: '',
    docDeathDivorceCert: '',
    docOther: '',
  });

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploadingField(fieldName);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', fieldName);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, [fieldName]: data.url }));
      } else {
        alert(data.error || 'Failed to upload document.');
      }
    } catch (err) {
      alert('Error connecting to upload server.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok) {
        alert(`Application submitted successfully! Ref ID: ${data.application.referenceNumber}`);
        fetchApplications();
      } else {
        setFormError(data.error || 'Failed to submit application.');
      }
    } catch (err) {
      setSubmitting(false);
      setFormError('Network error connecting to the server.');
    }
  };

  const activeApp = applications.length > 0 ? applications[0] : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-amber-400/20 text-amber-300 text-[11px] font-bold rounded-full uppercase tracking-wider border border-amber-400/30">
            Udaan 2026-27 Academic Cycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Student Portal</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Humane Touch Trust • Merit-cum-Means Higher Education Grant
          </p>
        </div>

        <button
          onClick={() => setIsPwdModalOpen(true)}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center space-x-2"
        >
          <span>🔒</span>
          <span>Change Password</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
          <p className="text-xs font-bold text-slate-400">Loading student records...</p>
        </div>
      ) : activeApp ? (
        /* STATE 1: ACTIVE DOSSIER (PROFORMA LOCKED) */
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-emerald-900 text-xs font-semibold">
            <div className="flex items-center space-x-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-bold text-emerald-950 text-sm">
                  Application Ref: <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{activeApp.referenceNumber || `HT/26-27/0001`}</span>
                </p>
                <p className="text-[11px] text-emerald-800">
                  Application registered. Further editing locked during evaluation cycle.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
              {activeApp.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Enrolled Course & Institution</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{activeApp.courseName}</h3>
                <p className="text-xs text-slate-500 font-medium">{activeApp.collegeName} ({activeApp.currentYearOfStudy})</p>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Merit Score</span>
                  <strong className="text-slate-800 text-sm">{activeApp.previousScoreMarks}%</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Annual Income</span>
                  <strong className="text-slate-800 text-sm">₹{Number(activeApp.familyAnnualIncome).toLocaleString('en-IN')}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tuition Fee</span>
                  <strong className="text-slate-800 text-sm">₹{Number(activeApp.annualTuitionFee).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Uploaded Documents Showcase */}
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5">
                  Uploaded Document Dossier
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeApp.docStudentAadhaar && (
                    <a href={activeApp.docStudentAadhaar} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-between font-semibold transition">
                      <span>📄 Student ID Document</span>
                      <span className="text-amber-600 font-bold text-[11px]">View ↗</span>
                    </a>
                  )}
                  {activeApp.docParentAadhaar && (
                    <a href={activeApp.docParentAadhaar} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-between font-semibold transition">
                      <span>📄 Parents ID Document</span>
                      <span className="text-amber-600 font-bold text-[11px]">View ↗</span>
                    </a>
                  )}
                  {activeApp.docIncomeCaste && (
                    <a href={activeApp.docIncomeCaste} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-between font-semibold transition">
                      <span>📄 Income / Caste Certificate</span>
                      <span className="text-amber-600 font-bold text-[11px]">View ↗</span>
                    </a>
                  )}
                  {activeApp.docMarksCards && (
                    <a href={activeApp.docMarksCards} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-between font-semibold transition">
                      <span>📄 Academic Marks Cards</span>
                      <span className="text-amber-600 font-bold text-[11px]">View ↗</span>
                    </a>
                  )}
                  {activeApp.docFeeDemandNote && (
                    <a href={activeApp.docFeeDemandNote} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-between font-semibold transition">
                      <span>📄 Fee Structure / Demand Note</span>
                      <span className="text-amber-600 font-bold text-[11px]">View ↗</span>
                    </a>
                  )}
                  {activeApp.docDeathDivorceCert && (
                    <a href={activeApp.docDeathDivorceCert} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-between font-semibold transition">
                      <span>📄 Death/Divorce Certificate</span>
                      <span className="text-amber-600 font-bold text-[11px]">View ↗</span>
                    </a>
                  )}
                  {activeApp.docOther && (
                    <a href={activeApp.docOther} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-between font-semibold transition">
                      <span>📄 Supporting Document</span>
                      <span className="text-amber-600 font-bold text-[11px]">View ↗</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Residential Address</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {activeApp.residentialAddress}
                </p>
              </div>
            </div>

            {/* Stepper & Dual Downloads */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Evaluation Process</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[11px]">✓</div>
                    <span className="font-bold text-slate-800">1. Intake & Docs Submitted</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      activeApp.status === 'DOC_VERIFICATION' ? 'bg-amber-500 text-white animate-pulse' :
                      activeApp.status === 'SUBMITTED' ? 'bg-amber-400 text-slate-900' : 'bg-emerald-500 text-white'
                    }`}>
                      {activeApp.status === 'SUBMITTED' || activeApp.status === 'DOC_VERIFICATION' ? '•' : '✓'}
                    </div>
                    <span className="font-semibold text-slate-700">2. In-Person Doc Check</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      activeApp.status === 'TRUSTEE_INTERVIEW' ? 'bg-purple-600 text-white animate-pulse' :
                      activeApp.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {activeApp.status === 'APPROVED' ? '✓' : '3'}
                    </div>
                    <span className="font-semibold text-slate-700">3. Trustee Interview</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      activeApp.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {activeApp.status === 'APPROVED' ? '✓' : '4'}
                    </div>
                    <span className="font-semibold text-slate-700">4. Grant Disbursal</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {activeApp.status === 'APPROVED' ? (
                  <div className="space-y-3 text-center">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block">Grant Sanctioned</span>
                      <strong className="text-lg font-black text-emerald-900">
                        ₹{Number(activeApp.sanctionedAmount).toLocaleString('en-IN')}
                      </strong>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCertApp(activeApp)}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                      >
                        <span>🎖️ Download Certificate of Accomplishment</span>
                      </button>
                      <button
                        onClick={() => setSelectedLetterApp(activeApp)}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
                      >
                        <span>📄 Download Official Award Letter</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                    <span className="text-base">⏳</span>
                    <p className="text-xs font-bold text-slate-800">Under Evaluation</p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Your Certificate of Accomplishment and Sanction Letter will unlock here once approved.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STATE 2: PROFORMA FORM */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div>
            <h3 className="text-lg font-black text-slate-900">Scholarship Application Proforma</h3>
            <p className="text-xs text-slate-500 mt-1">Please provide accurate academic, economic, and institutional details.</p>
          </div>

          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block border-b border-slate-100 pb-1">
                1. Academic & College Information
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">College / University Name *</label>
                  <input
                    type="text"
                    required
                    value={form.collegeName}
                    onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                    placeholder="e.g. St. Joseph's University"
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Course & Stream *</label>
                  <input
                    type="text"
                    required
                    value={form.courseName}
                    onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                    placeholder="e.g. B.Tech., 3rd Year"
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Year</label>
                  <select
                    value={form.currentYearOfStudy}
                    onChange={(e) => setForm({ ...form, currentYearOfStudy: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Previous Score (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.previousScoreMarks}
                    onChange={(e) => setForm({ ...form, previousScoreMarks: e.target.value })}
                    placeholder="85.5"
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Annual Tuition Fee Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.annualTuitionFee}
                    onChange={(e) => setForm({ ...form, annualTuitionFee: e.target.value })}
                    placeholder="45000"
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block border-b border-slate-100 pb-1">
                2. Socio-Economic Profile
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Annual Family Income (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.familyAnnualIncome}
                    onChange={(e) => setForm({ ...form, familyAnnualIncome: e.target.value })}
                    placeholder="150000"
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Household Category</label>
                  <select
                    value={form.householdCategory}
                    onChange={(e) => setForm({ ...form, householdCategory: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  >
                    <option value="General / EWS">General / Economically Weaker</option>
                    <option value="Single Parent">Single Parent Household</option>
                    <option value="Orphan">Orphan / Destitute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Residential Address *</label>
                <input
                  type="text"
                  required
                  value={form.residentialAddress}
                  onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })}
                  placeholder="Street / Locality in Bengaluru"
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Personal Need Statement *</label>
                <textarea
                  rows={2}
                  required
                  value={form.personalStatement}
                  onChange={(e) => setForm({ ...form, personalStatement: e.target.value })}
                  placeholder="Explain financial constraints and educational goals..."
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Document Upload Center */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block border-b border-slate-100 pb-1">
                3. Mandatory Document Uploads (PDF / JPG / PNG)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="font-bold text-slate-800 block">Student ID Document *</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload(e, 'docStudentAadhaar')}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 hover:file:bg-slate-300"
                  />
                  {form.docStudentAadhaar && <span className="text-[11px] text-emerald-700 font-bold block">✓ Uploaded Successfully</span>}
                  {uploadingField === 'docStudentAadhaar' && <span className="text-[11px] text-amber-600 block">Uploading...</span>}
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="font-bold text-slate-800 block">Parents ID Document *</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload(e, 'docParentAadhaar')}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 hover:file:bg-slate-300"
                  />
                  {form.docParentAadhaar && <span className="text-[11px] text-emerald-700 font-bold block">✓ Uploaded Successfully</span>}
                  {uploadingField === 'docParentAadhaar' && <span className="text-[11px] text-amber-600 block">Uploading...</span>}
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="font-bold text-slate-800 block">Income & Caste Certificate *</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload(e, 'docIncomeCaste')}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 hover:file:bg-slate-300"
                  />
                  {form.docIncomeCaste && <span className="text-[11px] text-emerald-700 font-bold block">✓ Uploaded Successfully</span>}
                  {uploadingField === 'docIncomeCaste' && <span className="text-[11px] text-amber-600 block">Uploading...</span>}
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="font-bold text-slate-800 block">Academic Marks Cards *</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload(e, 'docMarksCards')}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 hover:file:bg-slate-300"
                  />
                  {form.docMarksCards && <span className="text-[11px] text-emerald-700 font-bold block">✓ Uploaded Successfully</span>}
                  {uploadingField === 'docMarksCards' && <span className="text-[11px] text-amber-600 block">Uploading...</span>}
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="font-bold text-slate-800 block">Fee Structure / Demand Letter *</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload(e, 'docFeeDemandNote')}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 hover:file:bg-slate-300"
                  />
                  {form.docFeeDemandNote && <span className="text-[11px] text-emerald-700 font-bold block">✓ Uploaded Successfully</span>}
                  {uploadingField === 'docFeeDemandNote' && <span className="text-[11px] text-amber-600 block">Uploading...</span>}
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="font-bold text-slate-800 block">Death / Divorce Certificate (If Any)</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload(e, 'docDeathDivorceCert')}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 hover:file:bg-slate-300"
                  />
                  {form.docDeathDivorceCert && <span className="text-[11px] text-emerald-700 font-bold block">✓ Uploaded</span>}
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-800 block">Other Supporting Documents (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload(e, 'docOther')}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 hover:file:bg-slate-300"
                  />
                  {form.docOther && <span className="text-[11px] text-emerald-700 font-bold block">✓ Uploaded</span>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || uploadingField !== null}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition disabled:opacity-50 text-xs uppercase tracking-wider"
            >
              {submitting ? 'Registering Dossier...' : 'Submit Application & Complete Intake'}
            </button>
          </form>
        </div>
      )}

      {/* Award Letter PDF Modal */}
      {selectedLetterApp && (
        <SanctionLetterPDF
          application={selectedLetterApp}
          onClose={() => setSelectedLetterApp(null)}
        />
      )}

      {/* Certificate of Accomplishment Modal */}
      {selectedCertApp && (
        <CertificatePDF
          application={selectedCertApp}
          onClose={() => setSelectedCertApp(null)}
        />
      )}

      <ChangePasswordModal
        isOpen={isPwdModalOpen}
        onClose={() => setIsPwdModalOpen(false)}
      />
    </div>
  );
}