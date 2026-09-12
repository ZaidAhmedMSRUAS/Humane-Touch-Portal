'use client';
import React, { useState } from 'react';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export default function HistoricalDataUpload({ onSuccess, onClose }: Props) {
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleCsv = `fullName,phone,courseName,collegeName,yearOfStudy,sanctionedAmount,chequeNumber
Amina Bi,9845012345,B.Tech (Computer Science),PES University,2nd Year,25000,CHQ445120
Mohammad Bilal,9845098765,MBBS,Bangalore Medical College,3rd Year,40000,CHQ445121
Syeda Fatima,9880123456,B.Sc Nursing,St. Johns College of Nursing,1st Year,20000,CHQ445122`;

  const handleUpload = async () => {
    if (!csvText.trim()) {
      alert('Please paste CSV rows or fill in the records.');
      return;
    }

    setLoading(true);
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());

      const records = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const row: any = {};
        headers.forEach((h, i) => {
          row[h] = values[i];
        });
        return row;
      });

      const res = await fetch('/api/admin/historical-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academicYear, records }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✓ ${data.count} historical records imported successfully!`);
        onSuccess();
        onClose();
      } else {
        alert(data.error || 'Failed to import records');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-6 border border-slate-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900">Import Previous Years' Student Data</h3>
            <p className="text-xs text-slate-500">Upload past beneficiaries and track multi-year scholarship cycles</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold">✕</button>
        </div>

        <div className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Academic Year Cycle</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="2025-2026">2025–2026</option>
              <option value="2024-2025">2024–2025</option>
              <option value="2023-2024">2023–2024</option>
              <option value="2022-2023">2022–2023</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Paste CSV Data</label>
              <button
                type="button"
                onClick={() => setCsvText(sampleCsv)}
                className="text-[11px] font-bold text-amber-600 hover:underline"
              >
                Insert Sample Template
              </button>
            </div>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="fullName,phone,courseName,collegeName,yearOfStudy,sanctionedAmount,chequeNumber..."
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 font-bold text-xs rounded-xl text-slate-700">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-xs rounded-xl text-slate-950 disabled:opacity-50"
          >
            {loading ? 'Importing Records...' : 'Import Records'}
          </button>
        </div>
      </div>
    </div>
  );
}