'use client';
import React, { useState, useEffect } from 'react';

export default function PendingDeletionsAdminPanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState<{ [key: string]: string }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [clearingHistory, setClearingHistory] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/student-deletion/action');
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

  const handleAction = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    const confirmation = window.confirm(
      action === 'APPROVE'
        ? 'Are you sure you want to PERMANENTLY PURGE this student, their applications, and verification reports from the database?'
        : 'Are you sure you want to REJECT this deletion request?'
    );
    if (!confirmation) return;

    setProcessingId(requestId);
    try {
      const res = await fetch('/api/admin/student-deletion/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          adminRemarks: remarksMap[requestId] || '',
        }),
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

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all resolved deletion history? This cannot be undone.')) {
      return;
    }

    setClearingHistory(true);
    try {
      const res = await fetch('/api/admin/student-deletion/action', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        fetchRequests();
      } else {
        alert(data.error || 'Failed to clear history');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setClearingHistory(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const historyRequests = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-black text-slate-900">Student Deletion Authorization Desk</h2>
          <p className="text-xs text-slate-500">Review deletion requests submitted by Head Volunteer Nimra M</p>
        </div>
        <button
          onClick={fetchRequests}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-xl transition cursor-pointer"
        >
          🔄 Refresh Requests
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-8 text-center">Loading requests...</p>
      ) : pendingRequests.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs font-bold text-slate-600">No pending student deletion requests awaiting approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider">
            Pending Requests ({pendingRequests.length})
          </h3>

          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/40 space-y-3"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{req.studentName}</h4>
                  <p className="text-xs text-slate-600">
                    Registered Mobile: <strong className="font-mono">{req.studentPhone}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right text-[11px] text-slate-500">
                  <p>Requested by: <strong>{req.requestedByName}</strong> ({req.requestedByPhone})</p>
                  <p>{new Date(req.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800">
                <strong>Reason for Deletion:</strong> {req.reason}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Admin Remarks / Audit Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified duplicate application; proceeding with permanent purging."
                  value={remarksMap[req.id] || ''}
                  onChange={(e) =>
                    setRemarksMap({ ...remarksMap, [req.id]: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
                <button
                  onClick={() => handleAction(req.id, 'REJECT')}
                  disabled={processingId === req.id}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                >
                  ✕ Reject Request
                </button>
                <button
                  onClick={() => handleAction(req.id, 'APPROVE')}
                  disabled={processingId === req.id}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow transition cursor-pointer disabled:opacity-50"
                >
                  {processingId === req.id ? 'Purging...' : '✓ Approve & Purge Student'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved History */}
      {historyRequests.length > 0 && (
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">
              Resolved Deletion History ({historyRequests.length})
            </h3>
            <button
              onClick={handleClearHistory}
              disabled={clearingHistory}
              className="text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl border border-rose-200 transition cursor-pointer disabled:opacity-50"
            >
              {clearingHistory ? 'Clearing...' : '🗑️ Clear History'}
            </button>
          </div>

          <div className="space-y-2">
            {historyRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{req.studentName}</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="text-slate-600">Reason: {req.reason}</span>
                  {req.adminRemarks && (
                    <p className="text-[10px] text-slate-500 italic mt-0.5">Admin: "{req.adminRemarks}"</p>
                  )}
                </div>
                <div>
                  {req.status === 'APPROVED' ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg">
                      Approved by {req.resolvedBy || 'Admin'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-lg">
                      Rejected by {req.resolvedBy || 'Admin'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}