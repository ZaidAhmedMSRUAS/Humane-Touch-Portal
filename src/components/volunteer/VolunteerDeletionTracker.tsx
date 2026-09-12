'use client';
import React, { useState, useEffect } from 'react';

export default function VolunteerDeletionTracker() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/volunteer/deletion-requests');
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching deletion requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            Submitted Student Deletion Requests
          </h3>
          <p className="text-xs text-slate-500">
            Track student record deletion requests awaiting approval from Admin Zaid
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl transition"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-6 text-center">Loading requests...</p>
      ) : requests.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs">
          No deletion requests currently logged.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between gap-3 items-start md:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{req.studentName}</h4>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border text-slate-600">
                    {req.studentPhone}
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  <strong>Reason:</strong> {req.reason}
                </p>
                <p className="text-[11px] text-slate-400">
                  Requested by: <strong>{req.requestedByName}</strong> on{' '}
                  {new Date(req.createdAt).toLocaleDateString('en-IN')}
                </p>
                {req.adminRemarks && (
                  <p className="text-[11px] text-slate-600 italic mt-1">
                    Admin Note: "{req.adminRemarks}"
                  </p>
                )}
              </div>

              <div>
                {req.status === 'PENDING' && (
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-black rounded-xl inline-flex items-center gap-1.5">
                    ⏳ Pending Admin Approval
                  </span>
                )}
                {req.status === 'APPROVED' && (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl inline-flex items-center gap-1.5">
                    ✓ Approved & Deleted
                  </span>
                )}
                {req.status === 'REJECTED' && (
                  <span className="px-3 py-1.5 bg-rose-100 text-rose-800 text-xs font-black rounded-xl inline-flex items-center gap-1.5">
                    ✕ Rejected by Admin
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}