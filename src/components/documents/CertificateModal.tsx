'use client';
import React from 'react';
import Image from 'next/image';

interface Props {
  app: any;
  onClose: () => void;
}

export default function CertificateModal({ app, onClose }: Props) {
  if (!app) return null;

  const studentName = (app.student?.fullName || app.studentName || 'ZAID AHMED').toUpperCase();
  const course = app.courseName || 'B. Tech';
  const year = app.currentYearOfStudy || '1st Year';
  const college = app.collegeName || 'MSRUAS';
  const refNumber = app.referenceNumber || 'HT/26-27/0001';

  // Format ordinal date: "13th September 2026"
  const now = new Date();
  const day = now.getDate();
  const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor((day % 100) / 10) === 1) ? 0 : day % 10];
  const monthYear = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const formattedDate = `${day}${suffix} ${monthYear}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-4 my-6 print:my-0 print:p-0 print:shadow-none print:max-w-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 print:hidden">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            Official Scholar Commendation
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
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

        {/* Certificate Sheet (Faithful Replica) */}
        <div className="w-full bg-[#fdfdfd] border-[10px] border-double border-amber-600/90 p-8 sm:p-12 rounded-2xl relative text-center text-slate-900 shadow-sm print:border-8 print:border-amber-700 print:rounded-none">
          
          {/* Header & Logo */}
          <div className="flex flex-col items-center justify-center space-y-1 mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                HT
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 uppercase">Humane Touch</span>
            </div>
            <p className="text-[10px] font-black tracking-[0.25em] text-amber-800 uppercase">
              Humane Touch Trust Estd. 1999
            </p>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
              Higher Education Scholarship Council • Udaan Scholarship
            </p>
          </div>

          {/* Certificate Title */}
          <div className="my-4">
            <h1 className="text-xl sm:text-2xl font-black tracking-widest uppercase font-serif text-slate-950">
              Certificate of Accomplishment
            </h1>
            <p className="text-[11px] font-extrabold text-amber-700 tracking-[0.2em] uppercase mt-0.5">
              Udaan Scholarship 2026-27
            </p>
          </div>

          <p className="text-xs text-slate-500 italic my-2">
            This prestigious commendation is officially conferred upon
          </p>

          {/* Student Name */}
          <div className="my-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif tracking-wider border-b-2 border-slate-300 inline-block px-8 pb-1">
              {studentName}
            </h2>
            <div className="text-xs font-bold text-slate-800 mt-2">
              <span>{course} {year}</span>
              <span className="mx-2 text-slate-400">•</span>
              <span>{college}</span>
            </div>
          </div>

          {/* Commendation Text */}
          <p className="text-xs sm:text-[13px] text-slate-700 max-w-2xl mx-auto leading-relaxed mt-4">
            in recognition of exceptional academic merit, outstanding character, and dedication toward higher learning, having successfully qualified for educational financial sponsorship on this <strong className="text-slate-900">{formattedDate}</strong>.
          </p>

          {/* Bottom Badges & Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 items-end text-xs">
            
            {/* Left: Verified Seal */}
            <div className="flex flex-col items-start text-left">
              <div className="w-16 h-16 rounded-full border-2 border-amber-600/60 p-1 flex flex-col items-center justify-center text-center text-amber-800 font-black">
                <span className="text-[7px] uppercase tracking-tighter">Humane Touch</span>
                <span className="text-[8px] uppercase font-mono">1999</span>
                <span className="text-[6px] text-emerald-700 tracking-tighter">Verified Scholar</span>
              </div>
            </div>

            {/* Center: Reference & Motto */}
            <div className="text-center px-2 space-y-1">
              <div className="inline-block bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-amber-900">
                REF: {refNumber} • Sanction Approved
              </div>
              <p className="text-[9px] italic text-slate-500 font-serif leading-tight">
                &ldquo;Empowering deserving minds through human dignity and educational excellence.&rdquo;
              </p>
            </div>

            {/* Right: Trustee Signature */}
            <div className="flex flex-col items-end text-right">
              <div className="font-serif italic font-bold text-slate-900 text-sm">Tazaiyun Oomer</div>
              <div className="border-t border-slate-400 w-32 my-0.5"></div>
              <p className="font-bold text-[10px] text-slate-800 uppercase tracking-tight">Tazaiyun Oomer</p>
              <p className="text-[9px] text-slate-500">Secretary Board of Trustees</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}