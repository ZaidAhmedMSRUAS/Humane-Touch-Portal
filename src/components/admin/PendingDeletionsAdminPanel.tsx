'use client';
import React, { useState, useEffect } from 'react';

export default function PendingDeletionsAdminPanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/student-deletion/action');
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    const confirmMsg =
      action === 'APPROVE'
        ? 'Are you sure you want to permanently delete this student and all their records from the database?'
        : 'Reject this deletion request?';

    if (!window.confirm(confirmMsg)) return;

    setProcessingId(requestId);
    try {
      const res = await fetch('/api/admin/student-deletion/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        fetchRequests();
      } else {
        alert(data.error || 'Failed to process action');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            Student Deletion Requests
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">
                {pendingRequests.length} Pending
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500">Review and authorize deletion requests submitted by volunteers</p>
        </div>
        <button
          onClick={fetchRequests}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-6 text-center">Loading pending requests...</p>
      ) : pendingRequests.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          ✅ No pending deletion requests. All records are in order.
        </div>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{req.studentName}</h4>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border text-slate-600">
                    {req.studentPhone}
                  </span>
                </div>
                <p className="text-xs text-rose-900">
                  <strong>Reason:</strong> {req.reason}
                </p>
                <p className="text-[11px] text-slate-500">
                  Requested by: <strong>{req.requestedByName}</strong> ({req.requestedByPhone}) on{' '}
                  {new Date(req.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto">
                <button
                  disabled={processingId === req.id}
                  onClick={() => handleAction(req.id, 'REJECT')}
                  className="flex-1 md:flex-none px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  Reject
                </button>
                <button
                  disabled={processingId === req.id}
                  onClick={() => handleAction(req.id, 'APPROVE')}
                  className="flex-1 md:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {processingId === req.id ? 'Processing...' : 'Approve & Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}