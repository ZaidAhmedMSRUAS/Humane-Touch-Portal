'use client';
import React, { useState, useEffect } from 'react';
import CertificateModal from '@/components/documents/CertificateModal';
import AwardLetterModal from '@/components/documents/AwardLetterModal';

export default function TrusteeDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [infoModalApp, setInfoModalApp] = useState<any | null>(null);
  const [approvalModalApp, setApprovalModalApp] = useState<any | null>(null);
  const [sanctionedAmountInput, setSanctionedAmountInput] = useState('');
  const [certificateModalApp, setCertificateModalApp] = useState<any | null>(null);
  const [awardLetterModalApp, setAwardLetterModalApp] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);

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

  const handleApproveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalModalApp) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/trustee/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: approvalModalApp.id,
          action: 'APPROVE',
          sanctionedAmount: Number(sanctionedAmountInput) || approvalModalApp.annualTuitionFee,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setApprovalModalApp(null);
        fetchApplications();
      } else {
        alert(data.error || 'Failed to approve application');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectApplication = async (appId: string) => {
    if (!window.confirm('Are you sure you want to reject this scholarship application?')) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/trustee/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId,
          action: 'REJECT',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        fetchApplications();
      } else {
        alert(data.error || 'Failed to reject application');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const totalSanctioned = applications.reduce((acc, app) => acc + (app.sanctionedAmount || 0), 0);
  const totalApproved = applications.filter((app) => app.status === 'APPROVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Board of Trustees Portal
          </span>
          <h1 className="text-2xl font-black mt-2">Scholarship Evaluation & Document Sanction</h1>
          <p className="text-xs text-slate-300 mt-1">
            Grant trustee approvals to unlock official Certificates and Award Letters for qualified scholars
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
        <h2 className="text-base font-black text-slate-900 mb-4">Scholarship Evaluation Records</h2>

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
                  <th className="py-3 px-3">Tuition Fee</th>
                  <th className="py-3 px-3">Trustee Status</th>
                  <th className="py-3 px-3 text-right">Approval & Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const isApproved = app.status === 'APPROVED';
                  const report = app.verificationReport;

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
                        <div className="font-bold text-slate-900">{app.previousScoreMarks}% Marks</div>
                        <div className="text-[11px] text-slate-500">Income: ₹{app.familyAnnualIncome?.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">
                        ₹{app.annualTuitionFee?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3">
                        {isApproved ? (
                          <div>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded text-[10px] border border-emerald-200">
                              ✓ Approved
                            </span>
                            <div className="font-mono font-bold text-emerald-700 text-[11px] mt-0.5">
                              ₹{app.sanctionedAmount?.toLocaleString('en-IN')}
                            </div>
                          </div>
                        ) : app.status === 'REJECTED' ? (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-800 font-bold rounded text-[10px] border border-rose-200">
                            ✕ Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded text-[10px] border border-amber-200">
                            ⏳ Pending Approval
                          </span>
                        )}
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

                          {/* Approval / Grant Action Button */}
                          {!isApproved && app.status !== 'REJECTED' && (
                            <button
                              onClick={() => {
                                setApprovalModalApp(app);
                                setSanctionedAmountInput(String(app.annualTuitionFee || ''));
                              }}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] shadow transition cursor-pointer"
                            >
                              ✓ Approve Grant
                            </button>
                          )}

                          {/* Gated Documents: Only available AFTER Trustee Approval */}
                          {isApproved ? (
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
                          ) : (
                            <span className="text-[10px] text-slate-400 italic px-1">
                              (Docs locked until approval)
                            </span>
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

      {/* MODAL: TRUSTEE APPROVAL & GRANT AMOUNT SANCTION */}
      {approvalModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Trustee Grant Approval</h3>
              <button onClick={() => setApprovalModalApp(null)} className="w-8 h-8 rounded-full bg-slate-100 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleApproveApplication} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p><strong>Candidate:</strong> {approvalModalApp.student?.fullName || approvalModalApp.studentName}</p>
                <p><strong>Ref ID:</strong> <span className="font-mono font-bold text-amber-800">{approvalModalApp.referenceNumber}</span></p>
                <p><strong>Course & College:</strong> {approvalModalApp.courseName} ({approvalModalApp.collegeName})</p>
                <p><strong>Annual Tuition Fee:</strong> ₹{approvalModalApp.annualTuitionFee?.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sanctioned Grant Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={sanctionedAmountInput}
                  onChange={(e) => setSanctionedAmountInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm font-bold"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => handleRejectApplication(approvalModalApp.id)}
                  disabled={processing}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl cursor-pointer"
                >
                  Reject
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setApprovalModalApp(null)}
                    className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition cursor-pointer disabled:opacity-50"
                  >
                    {processing ? 'Sanctioning...' : '✓ Approve Grant'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOSSIER MODAL */}
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
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Tuition Fee:</strong> ₹{infoModalApp.annualTuitionFee?.toLocaleString('en-IN')}</div>
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

            {infoModalApp.verificationReport && (
              <div className="text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1">
                <p className="font-bold text-emerald-900">Volunteer Scrutiny Assessment:</p>
                <p className="text-emerald-800">{infoModalApp.verificationReport.remarks}</p>
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

      {/* DOCUMENT MODALS */}
      {certificateModalApp && (
        <CertificateModal
          app={certificateModalApp}
          onClose={() => setCertificateModalApp(null)}
        />
      )}

      {awardLetterModalApp && (
        <AwardLetterModal
          app={awardLetterModalApp}
          onClose={() => setAwardLetterModalApp(null)}
        />
      )}

    </div>
  );
}