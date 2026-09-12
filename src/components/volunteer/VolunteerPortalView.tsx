'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import RequestStudentDeletionModal from '@/components/RequestStudentDeletionModal';
import VolunteerDeletionTracker from '@/components/volunteer/VolunteerDeletionTracker';

export default function VolunteerPortalView() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentForDeletion, setSelectedStudentForDeletion] = useState<any | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/volunteer/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || data || []);
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
          <h1 className="text-2xl font-black mt-2">Scholarship Applications & Verification</h1>
          <p className="text-xs text-slate-300 mt-1">Review student dossiers, conduct verification, or request record deletions</p>
        </div>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition"
        >
          🔄 Refresh Applications
        </button>
      </div>

      {/* Applications List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-black text-slate-900 mb-4">Assigned Student Applications</h2>
        
        {loading ? (
          <p className="text-xs text-slate-400 py-8 text-center">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No student applications available at the moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Course & College</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">{app.referenceNumber || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{app.student?.fullName || app.studentName || 'Student'}</div>
                      <div className="text-[11px] text-slate-400">{app.student?.phone || app.studentPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.courseName}</div>
                      <div className="text-[11px] text-slate-400">{app.collegeName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-lg text-[10px] border border-amber-200">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() =>
                          setSelectedStudentForDeletion({
                            id: app.student?.id || app.studentId,
                            fullName: app.student?.fullName || app.studentName || 'Student',
                            phone: app.student?.phone || app.studentPhone || '',
                          })
                        }
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition text-[11px]"
                      >
                        🗑️ Request Deletion
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submitted Deletion Requests Tracker */}
      <VolunteerDeletionTracker />

      {/* Deletion Request Modal */}
      {selectedStudentForDeletion && (
        <RequestStudentDeletionModal
          student={selectedStudentForDeletion}
          onClose={() => setSelectedStudentForDeletion(null)}
          onSuccess={() => {
            fetchApplications();
          }}
        />
      )}

    </div>
  );
}