'use client';
import React from 'react';

export default function PrintButton() {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => window.print()}
        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
      >
        🖨️ Print / Save as PDF
      </button>
      <button
        type="button"
        onClick={() => window.close()}
        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
      >
        Close
      </button>
    </div>
  );
}