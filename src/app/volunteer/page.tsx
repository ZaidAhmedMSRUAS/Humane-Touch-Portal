'use client';
import React, { useState, useEffect } from 'react';
import RequestStudentDeletionModal from '@/components/RequestStudentDeletionModal';
import VolunteerDeletionTracker from '@/components/volunteer/VolunteerDeletionTracker';
import VolunteerVerificationModal from '@/components/volunteer/VolunteerVerificationModal';

export default function VolunteerDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedAppForVerification, setSelectedAppForVerification] = useState<any | null>(null);
  const [selectedStudentForDeletion, setSelectedStudentForDeletion] = useState<any | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/volunteer/applications');
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Volunteer Verification & Field Portal
          </span>
          <h1 className="text-2xl font-black mt-2">Allotted Student Dossiers & Verification</h1>
          <p className="text-xs text-slate-300 mt-1">
            Conduct document scrutiny, record the official "Cheque In Favour Of" payee, or forward deletion requests
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Applications List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-black text-slate-900 mb-4">
          Allotted Student Applications ({applications.length})
        </h2>
        
        {loading ? (
          <p className="text-xs text-slate-400 py-8 text-center">Loading assigned applications...</p>
        ) : applications.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-500">No student applications allotted to you at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-3">Ref ID</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Course & College</th>
                  <th className="py-3 px-3">Cheque Payee (In Favour Of)</th>
                  <th className="py-3 px-3">Verification Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
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
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {app.chequeInFavourOf}
                        </span>
                      ) : (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 italic">
                          Pending Payee Entry
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      {app.verificationReport ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded text-[10px] border border-emerald-200">
                          ✓ {app.verificationReport.status || 'Verified'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                          {app.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-1.5">
                      {/* 1. Verification & Cheque Payee Button */}
                      <button
                        onClick={() => setSelectedAppForVerification(app)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition text-[11px] shadow-sm cursor-pointer"
                      >
                        📋 Verify & Set Cheque Payee
                      </button>

                      {/* 2. Deletion Request Button */}
                      <button
                        onClick={() =>
                          setSelectedStudentForDeletion({
                            id: app.student?.id || app.studentId,
                            fullName: app.student?.fullName || app.studentName,
                            phone: app.student?.phone || app.studentPhone || '',
                          })
                        }
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition text-[11px] cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Volunteer Deletion Tracker Panel */}
      <VolunteerDeletionTracker />

      {/* Verification & Cheque Payee Modal */}
      {selectedAppForVerification && (
        <VolunteerVerificationModal
          app={selectedAppForVerification}
          onClose={() => setSelectedAppForVerification(null)}
          onSuccess={() => fetchApplications()}
        />
      )}

      {/* Deletion Request Modal */}
      {selectedStudentForDeletion && (
        <RequestStudentDeletionModal
          student={selectedStudentForDeletion}
          onClose={() => setSelectedStudentForDeletion(null)}
          onSuccess={() => fetchApplications()}
        />
      )}

    </div>
  );
}