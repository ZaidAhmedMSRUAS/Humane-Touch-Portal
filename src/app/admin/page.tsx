'use client';
import React, { useState, useEffect } from 'react';
import SanctionLetterPDF from '@/components/SanctionLetterPDF';
import CertificatePDF from '@/components/CertificatePDF';
import ChangePasswordModal from '@/components/ChangePasswordModal';

interface Volunteer {
  id: string;
  fullName: string;
  phone: string;
}

interface UserRecord {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: string;
  isActive: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

interface Application {
  id: string;
  referenceNumber?: string;
  collegeName: string;
  courseName: string;
  currentYearOfStudy: string;
  previousScoreMarks: number;
  familyAnnualIncome: number;
  annualTuitionFee: number;
  householdCategory: string;
  residentialAddress: string;
  personalStatement: string;
  status: string;
  sanctionedAmount?: number;
  chequeInFavourOf?: string;
  chequeNumber?: string;
  interviewRemarks?: string;
  interviewScore?: number;
  interviewConductedBy?: string;
  docStudentAadhaar?: string;
  docParentAadhaar?: string;
  docIncomeCaste?: string;
  docMarksCards?: string;
  docFeeDemandNote?: string;
  docDeathDivorceCert?: string;
  docOther?: string;
  createdAt: string;
  student?: { fullName: string; phone: string; email: string };
  assignedVolunteerId?: string;
  assignedVolunteer?: { fullName: string; phone: string };
  verificationReport?: {
    marksCardVerified: boolean;
    incomeCertificateVerified: boolean;
    feeDemandNoteVerified: boolean;
    chequePayeeVerified: string;
    volunteerRemarks: string;
    isRecommended: boolean;
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'USERS'>('APPLICATIONS');
  const [applications, setApplications] = useState<Application[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<{ [key: string]: string }>({});
  const [chequeInputs, setChequeInputs] = useState<{ [key: string]: string }>({});
  
  const [loading, setLoading] = useState(true);
  const [allocatingId, setAllocatingId] = useState<string | null>(null);
  const [savingChequeId, setSavingChequeId] = useState<string | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterVolunteer, setFilterVolunteer] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minScore, setMinScore] = useState<string>('');

  // Password Override Modal for Admin
  const [selectedUserForPwd, setSelectedUserForPwd] = useState<UserRecord | null>(null);
  const [adminOverridePassword, setAdminOverridePassword] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // Modals
  const [selectedLetterApp, setSelectedLetterApp] = useState<Application | null>(null);
  const [selectedCertApp, setSelectedCertApp] = useState<Application | null>(null);
  const [selectedAppInfo, setSelectedAppInfo] = useState<Application | null>(null);
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [appRes, volRes, usersRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/admin/volunteers'),
        fetch('/api/admin/users'),
      ]);

      if (appRes.ok) {
        const apps = await appRes.json();
        setApplications(apps);

        const volMap: { [key: string]: string } = {};
        const chqMap: { [key: string]: string } = {};

        apps.forEach((app: Application) => {
          if (app.assignedVolunteerId) volMap[app.id] = app.assignedVolunteerId;
          if (app.chequeNumber) chqMap[app.id] = app.chequeNumber;
        });

        setSelectedVolunteers(volMap);
        setChequeInputs(chqMap);
      }

      if (volRes.ok) {
        const vols = await volRes.json();
        setVolunteers(vols);
      }

      if (usersRes.ok) {
        const uList = await usersRes.json();
        setUsersList(uList);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignVolunteer = async (applicationId: string) => {
    const volunteerId = selectedVolunteers[applicationId];
    if (!volunteerId) {
      alert('Please choose a volunteer from the list.');
      return;
    }

    setAllocatingId(applicationId);
    try {
      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, volunteerId }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Volunteer allocated successfully!');
        fetchData();
      } else {
        alert(data.error || 'Failed to allocate volunteer.');
      }
    } catch (err) {
      alert('Network error allocating volunteer.');
    } finally {
      setAllocatingId(null);
    }
  };

  const handleSaveChequeNumber = async (applicationId: string) => {
    const chequeNumber = chequeInputs[applicationId];
    if (!chequeNumber) {
      alert('Please enter a cheque number.');
      return;
    }

    setSavingChequeId(applicationId);
    try {
      const res = await fetch('/api/admin/cheque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, chequeNumber }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Cheque number saved successfully!');
        fetchData();
      } else {
        alert(data.error || 'Failed to save cheque number.');
      }
    } catch (err) {
      alert('Network error saving cheque number.');
    } finally {
      setSavingChequeId(null);
    }
  };

  const handleAdminPasswordOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPwd || !adminOverridePassword) return;

    setPwdSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForPwd.id,
          newPassword: adminOverridePassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Password for ${selectedUserForPwd.fullName} successfully updated to: ${adminOverridePassword}`);
        setSelectedUserForPwd(null);
        setAdminOverridePassword('');
      } else {
        alert(data.error || 'Failed to update password.');
      }
    } catch (err) {
      alert('Network error updating password.');
    } finally {
      setPwdSubmitting(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus !== 'ALL' && app.status !== filterStatus) return false;
    if (filterVolunteer !== 'ALL') {
      if (filterVolunteer === 'UNASSIGNED' && app.assignedVolunteerId) return false;
      if (filterVolunteer !== 'UNASSIGNED' && app.assignedVolunteerId !== filterVolunteer) return false;
    }
    if (minScore && Number(app.previousScoreMarks) < Number(minScore)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = app.student?.fullName?.toLowerCase().includes(q);
      const phoneMatch = app.student?.phone?.includes(q);
      const collegeMatch = app.collegeName?.toLowerCase().includes(q);
      const courseMatch = app.courseName?.toLowerCase().includes(q);
      const chequeMatch = app.chequeNumber?.toLowerCase().includes(q);
      const refMatch = app.referenceNumber?.toLowerCase().includes(q);
      if (!nameMatch && !phoneMatch && !collegeMatch && !courseMatch && !chequeMatch && !refMatch) {
        return false;
      }
    }
    return true;
  });

  const handleExportCSV = () => {
    if (filteredApplications.length === 0) {
      alert('No applications found matching the selected filters.');
      return;
    }

    const headers = [
      'Ref ID',
      'Student Name',
      'Mobile Number',
      'College Name',
      'Course',
      'Year',
      'Marks (%)',
      'Income (INR)',
      'Tuition Fee (INR)',
      'Status',
      'Volunteer Auditor',
      'Cheque Payee',
      'Cheque Number',
      'Sanctioned Amount (INR)',
      'Submission Date',
    ];

    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '""';
      return `"${String(value).replace(/"/g, '""')}"`;
    };

    const csvRows = [
      headers.join(','),
      ...filteredApplications.map((app) => [
        escapeCSV(app.referenceNumber || app.id.slice(0, 8).toUpperCase()),
        escapeCSV(app.student?.fullName || 'N/A'),
        escapeCSV(app.student?.phone || 'N/A'),
        escapeCSV(app.collegeName),
        escapeCSV(app.courseName),
        escapeCSV(app.currentYearOfStudy),
        escapeCSV(app.previousScoreMarks),
        escapeCSV(app.familyAnnualIncome),
        escapeCSV(app.annualTuitionFee),
        escapeCSV(app.status),
        escapeCSV(app.assignedVolunteer?.fullName || 'Unassigned'),
        escapeCSV(app.chequeInFavourOf || app.verificationReport?.chequePayeeVerified || 'N/A'),
        escapeCSV(app.chequeNumber || 'Pending'),
        escapeCSV(app.sanctionedAmount ?? 0),
        escapeCSV(new Date(app.createdAt).toLocaleDateString('en-IN')),
      ].join(',')),
    ];

    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HumaneTouch_Udaan_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-amber-400/20 text-amber-300 text-[11px] font-bold rounded-full uppercase tracking-wider border border-amber-400/30">
            Intake, Credential & Disbursal Hub
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Admin Master Console</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Humane Touch Trust • Assign volunteers, manage user passwords, and issue grant instruments
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition flex items-center justify-center space-x-2"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsPwdModalOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center space-x-2"
          >
            <span>🔒</span>
            <span className="hidden sm:inline">Admin Password</span>
          </button>
        </div>
      </div>

      {/* Main Switcher Navigation */}
      <div className="flex bg-slate-200 p-1.5 rounded-2xl w-full max-w-md text-xs font-bold shadow-inner">
        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeTab === 'APPLICATIONS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📋 Application Pipeline ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeTab === 'USERS' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          👥 User Credentials & Passwords ({usersList.length})
        </button>
      </div>

      {activeTab === 'APPLICATIONS' ? (
        /* TAB 1: APPLICATIONS PIPELINE */
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Intake</span>
              <strong className="text-2xl font-black text-slate-900">{applications.length}</strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-amber-500 block text-[10px] uppercase font-bold">Doc Verification</span>
              <strong className="text-2xl font-black text-amber-600">
                {applications.filter((a) => a.status === 'SUBMITTED' || a.status === 'DOC_VERIFICATION').length}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-purple-500 block text-[10px] uppercase font-bold">Trustee Interview</span>
              <strong className="text-2xl font-black text-purple-600">
                {applications.filter((a) => a.status === 'TRUSTEE_INTERVIEW').length}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-emerald-500 block text-[10px] uppercase font-bold">Sanctioned Grants</span>
              <strong className="text-2xl font-black text-emerald-600">
                {applications.filter((a) => a.status === 'APPROVED').length}
              </strong>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Application Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="DOC_VERIFICATION">DOC_VERIFICATION</option>
                  <option value="TRUSTEE_INTERVIEW">TRUSTEE_INTERVIEW</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Assigned Volunteer</label>
                <select
                  value={filterVolunteer}
                  onChange={(e) => setFilterVolunteer(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                >
                  <option value="ALL">All Volunteers</option>
                  <option value="UNASSIGNED">Unassigned Only</option>
                  {volunteers.map((vol) => (
                    <option key={vol.id} value={vol.id}>{vol.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Minimum Score (%)</label>
                <input
                  type="number"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  placeholder="e.g. 75"
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Search Pipeline</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type name, phone, ref..."
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">Loading pipeline...</div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center text-xs font-semibold text-slate-400">No applications found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 tracking-wider">
                    <tr>
                      <th className="p-4">Ref & Candidate</th>
                      <th className="p-4">Score & Grant (₹)</th>
                      <th className="p-4">Allocate Doc Auditor</th>
                      <th className="p-4">Cheque Number (Admin Entry)</th>
                      <th className="p-4 text-right">Actions & Downloads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <span className="font-mono text-amber-700 font-bold block text-[10px]">
                            {app.referenceNumber || 'HT/26-27/0001'}
                          </span>
                          <strong className="text-slate-900 block text-sm">{app.student?.fullName || 'Student'}</strong>
                          <span className="text-[11px] text-slate-500">{app.courseName} • {app.collegeName}</span>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            app.status === 'TRUSTEE_INTERVIEW' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="text-emerald-700 font-bold block">{app.previousScoreMarks}% Marks</span>
                          {app.status === 'APPROVED' ? (
                            <span className="text-sm font-black text-emerald-800 block mt-0.5">
                              Grant: ₹{Number(app.sanctionedAmount).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] block mt-0.5">
                              Fee: ₹{Number(app.annualTuitionFee).toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>

                        <td className="p-4 min-w-[200px]">
                          <div className="flex items-center space-x-1.5">
                            <select
                              value={selectedVolunteers[app.id] || ''}
                              onChange={(e) => setSelectedVolunteers({ ...selectedVolunteers, [app.id]: e.target.value })}
                              className="w-full text-xs border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                            >
                              <option value="">-- Choose Volunteer --</option>
                              {volunteers.map((vol) => (
                                <option key={vol.id} value={vol.id}>{vol.fullName}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignVolunteer(app.id)}
                              disabled={allocatingId === app.id || !selectedVolunteers[app.id]}
                              className="px-2.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg transition text-xs flex-shrink-0 disabled:opacity-40"
                            >
                              {allocatingId === app.id ? '...' : 'Assign'}
                            </button>
                          </div>
                          {app.assignedVolunteer && (
                            <span className="text-[10px] text-purple-700 font-semibold block mt-1">
                              Assigned: {app.assignedVolunteer.fullName}
                            </span>
                          )}
                        </td>

                        <td className="p-4 min-w-[220px]">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="text"
                                value={chequeInputs[app.id] || ''}
                                onChange={(e) => setChequeInputs({ ...chequeInputs, [app.id]: e.target.value })}
                                placeholder="e.g. CHQ-984210"
                                className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                              />
                              <button
                                onClick={() => handleSaveChequeNumber(app.id)}
                                disabled={savingChequeId === app.id}
                                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition text-xs flex-shrink-0 disabled:opacity-40"
                              >
                                {savingChequeId === app.id ? '...' : 'Save'}
                              </button>
                            </div>
                            {app.chequeInFavourOf && (
                              <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                                Payee: <strong>{app.chequeInFavourOf}</strong>
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedAppInfo(app)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                          >
                            Info
                          </button>
                          {app.status === 'APPROVED' && (
                            <>
                              <button
                                onClick={() => setSelectedCertApp(app)}
                                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black transition shadow-sm"
                              >
                                🎖️ Certificate
                              </button>
                              <button
                                onClick={() => setSelectedLetterApp(app)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                              >
                                📄 Award Letter
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: USER CREDENTIAL & PASSWORD MANAGEMENT */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">User Account & Password Override Console</h3>
              <p className="text-xs text-slate-500">
                View verified mobile numbers, roles, and directly reset passwords for any student, volunteer, trustee, or admin.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
            >
              🔄 Refresh List
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="p-3.5">Name & Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Mobile Contact</th>
                  <th className="p-3.5">Verification Status</th>
                  <th className="p-3.5 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <strong className="text-slate-900 block text-sm">{u.fullName}</strong>
                      <span className="text-slate-500 text-[11px]">{u.email || 'No email registered'}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">
                      +91 {u.phone}
                    </td>
                    <td className="p-3.5 space-x-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isPhoneVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        📱 {u.isPhoneVerified ? 'Phone Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedUserForPwd(u);
                          setAdminOverridePassword('');
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
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

      {/* Admin Password Override Modal */}
      {selectedUserForPwd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Admin Password Override</h3>
                <p className="text-xs text-slate-500">
                  User: <strong>{selectedUserForPwd.fullName}</strong> ({selectedUserForPwd.role})
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForPwd(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminPasswordOverride} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <p><strong>Mobile Number:</strong> +91 {selectedUserForPwd.phone}</p>
                <p>Setting a new password will immediately override their previous credentials.</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Assign New Password (Min 6 chars) *
                </label>
                <input
                  type="text"
                  required
                  value={adminOverridePassword}
                  onChange={(e) => setAdminOverridePassword(e.target.value)}
                  placeholder="e.g. Pass@2026 or SecurePass"
                  className="w-full text-sm font-bold border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPwd(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwdSubmitting || !adminOverridePassword}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {pwdSubmitting ? 'Updating...' : 'Set New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {selectedAppInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">{selectedAppInfo.referenceNumber}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedAppInfo.student?.fullName}</h3>
                <p className="text-xs text-slate-500">{selectedAppInfo.courseName} • {selectedAppInfo.collegeName}</p>
              </div>
              <button
                onClick={() => setSelectedAppInfo(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <p><strong>Mobile:</strong> {selectedAppInfo.student?.phone}</p>
              <p><strong>Address:</strong> {selectedAppInfo.residentialAddress}</p>
              <p><strong>Need Statement:</strong> <em>"{selectedAppInfo.personalStatement}"</em></p>
              <p><strong>Cheque Payee:</strong> {selectedAppInfo.chequeInFavourOf || 'Not verified yet'}</p>
              <p><strong>Cheque Number:</strong> <span className="font-mono font-bold text-amber-700">{selectedAppInfo.chequeNumber || 'Pending'}</span></p>
            </div>

            <button
              onClick={() => setSelectedAppInfo(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Award Letter PDF */}
      {selectedLetterApp && (
        <SanctionLetterPDF application={selectedLetterApp} onClose={() => setSelectedLetterApp(null)} />
      )}

      {/* Certificate PDF */}
      {selectedCertApp && (
        <CertificatePDF application={selectedCertApp} onClose={() => setSelectedCertApp(null)} />
      )}

      {/* Self Password Modal */}
      <ChangePasswordModal isOpen={isPwdModalOpen} onClose={() => setIsPwdModalOpen(false)} />
    </div>
  );
}