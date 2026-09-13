'use client';
import React from 'react';

interface Props {
  app: any;
  onClose: () => void;
}

export default function CertificateModal({ app, onClose }: Props) {
  if (!app) return null;

  const studentName = app.student?.fullName || app.studentName || 'Student Scholar';
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const grantAmount = app.sanctionedAmount || app.annualTuitionFee || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print:my-0 print:p-0 print:shadow-none print:border-none print:max-w-none">
        
        {/* Top Actions Bar (Hidden on Print) */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900">🎓 Certificate of Accomplishment</span>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-200">
              {app.referenceNumber || 'HT/26-27/AWARD'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              🖨️ Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Certificate Container (A4 Landscape Formatted) */}
        <div className="w-full bg-white border-[10px] border-double border-amber-600 p-8 sm:p-12 rounded-2xl relative text-center print:border-8 print:border-amber-700 print:rounded-none">
          
          {/* Corner Ornaments */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-600"></div>
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-600"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-600"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-600"></div>

          {/* Header */}
          <div className="space-y-1 mb-6">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-amber-700">
              Humane Touch Trust (Regd.)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Empowering Higher Education Through Udaan Scholarship Program
            </p>
            <div className="w-20 h-0.5 bg-amber-500 mx-auto my-2"></div>
          </div>

          {/* Certificate Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif uppercase my-3">
            Certificate of Accomplishment
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            This is to proudly certify that
          </p>

          {/* Student Name */}
          <div className="my-5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif border-b-2 border-slate-300 inline-block px-8 pb-1">
              {studentName}
            </h2>
          </div>

          {/* Body */}
          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed">
            has been conferred the prestigious <strong className="text-amber-800">Humane Touch Udaan Scholarship</strong> in recognition of academic excellence and dedication towards pursuing{' '}
            <strong className="text-slate-900">{app.courseName}</strong> at{' '}
            <strong className="text-slate-900">{app.collegeName}</strong> for the academic cycle.
          </p>

          {/* Sanction Ref & Award Amount */}
          <div className="my-6 flex justify-center items-center gap-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-xl font-mono font-bold text-amber-900">
              Sanction Ref: {app.referenceNumber || 'HT/26-27/AWARD'}
            </div>
            {grantAmount > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-xl font-mono font-bold text-emerald-900">
                Grant Amount: ₹{grantAmount.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {/* Signatures & Seal */}
          <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-3 items-end text-xs">
            <div className="text-left">
              <p className="text-slate-400 text-[10px]">Date of Issue</p>
              <p className="font-bold text-slate-800 mt-1">{issueDate}</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-500 mx-auto flex items-center justify-center text-[9px] font-black text-amber-700 uppercase">
                Trust Seal
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif italic font-bold text-slate-900 text-sm">Tazaiyun Oomer</div>
              <div className="border-t border-slate-400 w-32 ml-auto my-1"></div>
              <p className="font-bold text-[11px] text-slate-700">Secretary & Trustee</p>
              <p className="text-[10px] text-slate-400">Humane Touch Trust</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}