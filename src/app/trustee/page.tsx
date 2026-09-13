'use client';
import React, { useState, useEffect } from 'react';
import CertificateModal from '@/components/documents/CertificateModal';
import AwardLetterModal from '@/components/documents/AwardLetterModal';
import TrusteeInterviewModal from '@/components/trustee/TrusteeInterviewModal';

export default function TrusteeDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [infoModalApp, setInfoModalApp] = useState<any | null>(null);
  const [interviewModalApp, setInterviewModalApp] = useState<any | null>(null);
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
  const totalApproved = applications.filter((app) => app.status === 'APPROVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Board of Trustees Cockpit
          </span>
          <h1 className="text-2xl font-black mt-2">In-Person Interview & Sanction Desk</h1>
          <p className="text-xs text-slate-300 mt-1">
            Conduct in-person candidate interviews, record scoring observations, and sanction scholarship grants
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
        >
          🔄 Refresh Cockpit
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Registered Candidates</p>
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

      {/* Applications & Interview Action Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-black text-slate-900 mb-4">Candidates Awaiting Interview & Sanction</h2>

        {loading ? (
          <p className="text-xs text-slate-400 py-8 text-center">Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-500">No applications registered in system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-3">Ref ID</th>
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Course & College</th>
                  <th className="py-3 px-3">Cheque Payee</th>
                  <th className="py-3 px-3">Sanction Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Trustee Interview Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const isApproved = app.status === 'APPROVED';

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
                        {app.chequeInFavourOf ? (
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {app.chequeInFavourOf}
                          </span>
                        ) : (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 italic">
                            Pending Volunteer
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {app.sanctionedAmount ? (
                          <span className="font-mono font-bold text-emerald-800">
                            ₹{app.sanctionedAmount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Fee: ₹{app.annualTuitionFee?.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 font-bold rounded text-[10px] border ${
                          isApproved ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex justify-end gap-1.5 flex-wrap items-center">
                          {/* Dossier Info */}
                          <button
                            onClick={() => setInfoModalApp(app)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
                          >
                            ℹ️ Info
                          </button>

                          {/* 🎙️ CONDUCT IN-PERSON INTERVIEW BUTTON */}
                          <button
                            onClick={() => setInterviewModalApp(app)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[11px] shadow transition cursor-pointer flex items-center gap-1"
                          >
                            🎙️ {isApproved ? 'Re-Interview / Edit' : 'Conduct Interview'}
                          </button>

                          {/* Gated Documents */}
                          {isApproved && (
                            <>
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
                            </>
                          )}
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

      {/* 1. TRUSTEE IN-PERSON INTERVIEW MODAL */}
      {interviewModalApp && (
        <TrusteeInterviewModal
          app={interviewModalApp}
          onClose={() => setInterviewModalApp(null)}
          onSuccess={() => fetchApplications()}
        />
      )}

      {/* 2. DOSSIER INFO MODAL */}
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
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Score:</strong> {infoModalApp.previousScoreMarks}%</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Annual Income:</strong> ₹{infoModalApp.familyAnnualIncome?.toLocaleString('en-IN')}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Tuition Fee:</strong> ₹{infoModalApp.annualTuitionFee?.toLocaleString('en-IN')}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Household Category:</strong> {infoModalApp.householdCategory}</div>
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

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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

      {/* 3. CERTIFICATE MODAL */}
      {certificateModalApp && (
        <CertificateModal
          app={certificateModalApp}
          onClose={() => setCertificateModalApp(null)}
        />
      )}

      {/* 4. AWARD LETTER MODAL */}
      {awardLetterModalApp && (
        <AwardLetterModal
          app={awardLetterModalApp}
          onClose={() => setAwardLetterModalApp(null)}
        />
      )}

    </div>
  );
}