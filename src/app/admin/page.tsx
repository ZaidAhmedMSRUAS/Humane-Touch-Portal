'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PendingDeletionsAdminPanel from '@/components/admin/PendingDeletionsAdminPanel';
import CertificateModal from '@/components/documents/CertificateModal';
import AwardLetterModal from '@/components/documents/AwardLetterModal';
import { getDesignation } from '@/lib/designations';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'applications' | 'users' | 'deletions'>('applications');
  const [applications, setApplications] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [infoModalApp, setInfoModalApp] = useState<any | null>(null);
  const [certificateModalApp, setCertificateModalApp] = useState<any | null>(null);
  const [awardLetterModalApp, setAwardLetterModalApp] = useState<any | null>(null);

  // Cheque & Password Reset Modals
  const [chequeModalApp, setChequeModalApp] = useState<any | null>(null);
  const [chequeNumberInput, setChequeNumberInput] = useState('');
  const [chequePayeeInput, setChequePayeeInput] = useState('');
  const [sanctionedAmountInput, setSanctionedAmountInput] = useState('');

  const [passwordResetUser, setPasswordResetUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/actions');
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(data.applications || []);
        setVolunteers(data.volunteers || []);
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAssignVolunteer = async (applicationId: string, volunteerId: string) => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ASSIGN_VOLUNTEER', applicationId, volunteerId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Volunteer assigned successfully');
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to assign volunteer');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    }
  };

  const handleSaveCheque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chequeModalApp) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_CHEQUE',
          applicationId: chequeModalApp.id,
          chequeNumber: chequeNumberInput,
          chequeInFavourOf: chequePayeeInput,
          sanctionedAmount: Number(sanctionedAmountInput) || chequeModalApp.annualTuitionFee,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Cheque & Disbursal details saved successfully!');
        setChequeModalApp(null);
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to save cheque details');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser || !newPasswordInput.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_PASSWORD',
          targetUserId: passwordResetUser.id,
          newPassword: newPasswordInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Password for ${passwordResetUser.fullName} updated successfully.`);
        setPasswordResetUser(null);
        setNewPasswordInput('');
      } else {
        alert(data.error || 'Failed to reset password');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Executive Control Center
          </span>
          <h1 className="text-2xl font-black mt-2">Admin Management Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">
            Supervise disbursements, assign volunteers, and issue documents for Trustee-approved scholars
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/historical-import"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition"
          >
            📥 Import Historical Data
          </Link>
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'applications' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📄 Applications & Documents ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          👥 User Directory & Passwords ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('deletions')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'deletions' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🗑️ Pending Deletions
        </button>
      </div>

      {/* Applications & Documents List */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-black text-slate-900 mb-4">Scholarship Applications, Disbursals & Document Issuance</h3>
          {loading ? (
            <p className="text-xs text-slate-400 py-8 text-center">Loading applications...</p>
          ) : applications.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No applications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-3">Ref ID</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Course & College</th>
                    <th className="py-3 px-3">Volunteer</th>
                    <th className="py-3 px-3">Cheque Details</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Official Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => {
                    const isApproved = app.status === 'APPROVED';

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-3 font-mono font-bold text-amber-800">{app.referenceNumber || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{app.student?.fullName}</div>
                          <div className="text-[11px] text-slate-400">{app.student?.phone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{app.courseName}</div>
                          <div className="text-[11px] text-slate-400">{app.collegeName}</div>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={app.assignedVolunteerId || ''}
                            onChange={(e) => handleAssignVolunteer(app.id, e.target.value)}
                            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          >
                            <option value="">Unassigned</option>
                            {volunteers.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.fullName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          {app.chequeNumber ? (
                            <div>
                              <div className="font-mono font-bold text-emerald-700">#{app.chequeNumber}</div>
                              <div className="text-[11px] text-slate-500">₹{app.sanctionedAmount?.toLocaleString('en-IN')}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Pending Entry</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 font-bold rounded text-[10px] border ${
                            isApproved ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end items-center gap-1.5 flex-wrap">
                            {/* Info */}
                            <button
                              onClick={() => setInfoModalApp(app)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] shadow-sm transition cursor-pointer"
                            >
                              ℹ️ Info
                            </button>

                            {/* Cheque Disbursal */}
                            <button
                              onClick={() => {
                                setChequeModalApp(app);
                                setChequeNumberInput(app.chequeNumber || '');
                                setChequePayeeInput(app.chequeInFavourOf || app.collegeName || '');
                                setSanctionedAmountInput(String(app.sanctionedAmount || app.annualTuitionFee || ''));
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] border border-slate-300 transition cursor-pointer"
                            >
                              💳 Cheque
                            </button>

                            {/* GATED DOCUMENTS: Only accessible after Trustee Approval */}
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
                                (Awaiting Trustee Approval)
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
      )}

      {/* Users Directory */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-black text-slate-900 mb-4">All Registered Staff & Student Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.fullName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{u.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-[10px]">
                        {getDesignation(u.fullName, u.role, u.phone)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setPasswordResetUser(u);
                          setNewPasswordInput('');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[11px] border border-slate-300 transition cursor-pointer"
                      >
                        🔑 Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Deletions */}
      {activeTab === 'deletions' && <PendingDeletionsAdminPanel />}

      {/* DOSSIER MODAL */}
      {infoModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{infoModalApp.student?.fullName} - Dossier</h3>
                <p className="text-xs font-mono font-bold text-amber-700">{infoModalApp.referenceNumber}</p>
              </div>
              <button onClick={() => setInfoModalApp(null)} className="w-8 h-8 rounded-full bg-slate-100 font-bold cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Phone:</strong> {infoModalApp.student?.phone}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Course:</strong> {infoModalApp.courseName}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>College:</strong> {infoModalApp.collegeName}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Year:</strong> {infoModalApp.currentYearOfStudy}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Score:</strong> {infoModalApp.previousScoreMarks}%</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Annual Income:</strong> ₹{infoModalApp.familyAnnualIncome?.toLocaleString('en-IN')}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Tuition Fee:</strong> ₹{infoModalApp.annualTuitionFee?.toLocaleString('en-IN')}</div>
              <div className="bg-slate-50 p-3 rounded-xl"><strong>Status:</strong> {infoModalApp.status}</div>
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

      {/* CHEQUE MODAL */}
      {chequeModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Record Cheque & Sanction</h3>
              <button onClick={() => setChequeModalApp(null)} className="w-8 h-8 rounded-full bg-slate-100 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveCheque} className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl font-semibold text-slate-800">
                {chequeModalApp.student?.fullName} ({chequeModalApp.referenceNumber})
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cheque Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 408219"
                  value={chequeNumberInput}
                  onChange={(e) => setChequeNumberInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cheque In Favour Of *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.S. Ramaiah Institute of Technology"
                  value={chequePayeeInput}
                  onChange={(e) => setChequePayeeInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sanctioned Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={sanctionedAmountInput}
                  onChange={(e) => setSanctionedAmountInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChequeModalApp(null)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow transition cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Admin Password Override</h3>
              <button onClick={() => setPasswordResetUser(null)} className="w-8 h-8 rounded-full bg-slate-100 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                Resetting password for <strong>{passwordResetUser.fullName}</strong> ({passwordResetUser.phone})
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Set New Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password (min 6 characters)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition cursor-pointer"
                >
                  {actionLoading ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
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