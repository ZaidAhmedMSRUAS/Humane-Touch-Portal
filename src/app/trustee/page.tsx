'use client';
import React, { useState, useEffect } from 'react';
import CertificateModal from '@/components/documents/CertificateModal';
import AwardLetterModal from '@/components/documents/AwardLetterModal';

export default function TrusteeDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [infoModalApp, setInfoModalApp] = useState<any | null>(null);
  const [certificateModalApp, setCertificateModalApp] = useState<any | null>(null);
  const [awardLetterModalApp, setAwardLetterModalApp] = useState<any | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trustee/applications');
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications for trustees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const totalSanctioned = applications.reduce((acc, app) => acc + (app.sanctionedAmount || 0), 0);
  const totalApproved = applications.filter((app) => app.status === 'APPROVED' || app.sanctionedAmount > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Board of Trustees Portal
          </span>
          <h1 className="text-2xl font-black mt-2">Scholarship Review & Evaluation Desk</h1>
          <p className="text-xs text-slate-300 mt-1">
            Review interview evaluations, verify student dossiers, and issue official Certificates & Award Letters
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Candidates</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{applications.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Sanctioned Grants</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalSanctioned.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Approved Scholars</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{totalApproved}</p>
        </div>
      </div>

      {/* Applications Review Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-black text-slate-900 mb-4">Scholarship Candidates & Post-Interview Records</h2>

        {loading ? (
          <p className="text-xs text-slate-400 py-8 text-center">Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-500">No applications registered currently.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-3">Ref ID</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Course & College</th>
                  <th className="py-3 px-3">Score & Income</th>
                  <th className="py-3 px-3">Interview / Verification</th>
                  <th className="py-3 px-3">Sanctioned Grant</th>
                  <th className="py-3 px-3 text-right">Dossier & Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const report = app.verificationReport || app.verificationReports?.[0];
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-amber-800">
                        {app.referenceNumber || 'N/A'}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{app.student?.fullName || app.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{app.student?.phone || app.studentPhone}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{app.courseName}</div>
                        <div className="text-[11px] text-slate-400">{app.collegeName}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{app.previousScoreMarks}% Score</div>
                        <div className="text-[11px] text-slate-500">Income: ₹{app.familyAnnualIncome?.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        {report ? (
                          <div>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded text-[10px] border border-emerald-200">
                              ✓ Verified
                            </span>
                            {report.remarks && (
                              <p className="text-[10px] text-slate-500 truncate max-w-[140px] mt-0.5" title={report.remarks}>
                                {report.remarks}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded text-[10px] border border-amber-200">
                            {app.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {app.sanctionedAmount ? (
                          <div>
                            <span className="font-mono font-bold text-emerald-800">₹{app.sanctionedAmount.toLocaleString('en-IN')}</span>
                            {app.chequeNumber && (
                              <p className="text-[10px] text-slate-400 font-mono">Cheque #{app.chequeNumber}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Fee: ₹{app.annualTuitionFee?.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => setInfoModalApp(app)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
                          >
                            ℹ️ Info
                          </button>

                          <button
                            onClick={() => setCertificateModalApp(app)}
                            className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-[11px] transition cursor-pointer"
                          >
                            🎓 Certificate
                          </button>

                          <button
                            onClick={() => setAwardLetterModalApp(app)}
                            className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg text-[11px] transition cursor-pointer"
                          >
                            📜 Award Letter
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. STUDENT DOSSIER INFO MODAL */}
      {infoModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{infoModalApp.student?.fullName || infoModalApp.studentName} - Dossier</h3>
                <p className="text-xs font-mono font-bold text-amber-700">{infoModalApp.referenceNumber}</p>
              </div>
              <button onClick={() => setInfoModalApp(null)} className="w-8 h-8 rounded-full bg-slate-100 font-bold cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Phone:</strong> {infoModalApp.student?.phone || infoModalApp.studentPhone}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Course:</strong> {infoModalApp.courseName}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>College:</strong> {infoModalApp.collegeName}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Year:</strong> {infoModalApp.currentYearOfStudy}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Academic Score:</strong> {infoModalApp.previousScoreMarks}%</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Annual Income:</strong> ₹{infoModalApp.familyAnnualIncome?.toLocaleString('en-IN')}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Annual Tuition Fee:</strong> ₹{infoModalApp.annualTuitionFee?.toLocaleString('en-IN')}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Category:</strong> {infoModalApp.householdCategory}</div>
            </div>

            {infoModalApp.residentialAddress && (
              <div className="text-xs bg-slate-50 p-3 rounded-xl">
                <strong>Residential Address:</strong> {infoModalApp.residentialAddress}
              </div>
            )}

            {infoModalApp.personalStatement && (
              <div className="text-xs bg-slate-50 p-3 rounded-xl">
                <strong>Personal Statement:</strong> {infoModalApp.personalStatement}
              </div>
            )}

            {(infoModalApp.verificationReport || infoModalApp.verificationReports?.[0]) && (
              <div className="text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1">
                <p className="font-bold text-emerald-900">Volunteer Verification & Interview Assessment:</p>
                <p className="text-emerald-800">
                  {(infoModalApp.verificationReport || infoModalApp.verificationReports?.[0]).remarks}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setCertificateModalApp(infoModalApp);
                  setInfoModalApp(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                🎓 View Certificate
              </button>
              <button
                onClick={() => {
                  setAwardLetterModalApp(infoModalApp);
                  setInfoModalApp(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                📜 View Award Letter
              </button>
              <button
                onClick={() => setInfoModalApp(null)}
                className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-700 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. IN-PORTAL CERTIFICATE MODAL */}
      {certificateModalApp && (
        <CertificateModal
          app={certificateModalApp}
          onClose={() => setCertificateModalApp(null)}
        />
      )}

      {/* 3. IN-PORTAL AWARD LETTER MODAL */}
      {awardLetterModalApp && (
        <AwardLetterModal
          app={awardLetterModalApp}
          onClose={() => setAwardLetterModalApp(null)}
        />
      )}

    </div>
  );
}