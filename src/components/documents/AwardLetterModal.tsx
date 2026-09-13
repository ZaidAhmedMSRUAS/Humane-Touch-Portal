'use client';
import React from 'react';

interface Props {
  app: any;
  onClose: () => void;
}

export default function AwardLetterModal({ app, onClose }: Props) {
  if (!app) return null;

  const studentName = app.student?.fullName || app.studentName || 'Student Scholar';
  const studentPhone = app.student?.phone || app.studentPhone || 'N/A';
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const amount = app.sanctionedAmount || app.annualTuitionFee || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print:my-0 print:p-0 print:shadow-none print:border-none print:max-w-none">
        
        {/* Top Actions Bar (Hidden on Print) */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900">📜 Scholarship Award & Sanction Letter</span>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {app.referenceNumber || 'HT/26-27/SANCTION'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
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

        {/* Letterhead Container (A4 Portrait Format) */}
        <div className="w-full bg-white border border-slate-300 p-8 sm:p-10 shadow-sm print:shadow-none print:border-none text-slate-900 font-sans leading-relaxed text-xs sm:text-sm">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-3 mb-5 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                Humane Touch Trust (Regd.)
              </h1>
              <p className="text-[11px] text-slate-600">
                #45, 1st Floor, Victoria Road, Bengaluru - 560047, Karnataka, India
              </p>
              <p className="text-[11px] text-slate-600">
                Email: info@humanetouch.org | Web: https://humanetouch.org
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md font-mono">
                OFFICIAL SANCTION
              </span>
            </div>
          </div>

          {/* Reference & Date */}
          <div className="flex justify-between items-center mb-5 text-xs font-semibold">
            <div>
              <strong>Sanction Ref:</strong> <span className="font-mono text-amber-800">{app.referenceNumber || 'HT/26-27/SANCTION'}</span>
            </div>
            <div>
              <strong>Date:</strong> {issueDate}
            </div>
          </div>

          {/* To Recipient */}
          <div className="mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <p className="font-bold text-slate-800">To,</p>
            <p className="font-black text-slate-900 text-sm">{studentName}</p>
            <p className="text-slate-600">Student Scholar, Phone: {studentPhone}</p>
            <p className="text-slate-600">Enrolled Course: {app.courseName}</p>
            <p className="text-slate-600">Institution: {app.collegeName}</p>
          </div>

          {/* Subject */}
          <div className="mb-4 font-bold text-slate-900 underline text-xs">
            Subject: Sanction of Humane Touch Udaan Higher Education Scholarship
          </div>

          {/* Body */}
          <div className="space-y-3 text-justify text-xs leading-relaxed">
            <p>Dear <strong>{studentName}</strong>,</p>

            <p>
              We take pleasure in informing you that following the verification of your academic credentials and evaluation by our Board of Trustees, the Humane Touch Trust has approved your financial scholarship grant under the <strong>Udaan Higher Education Support Initiative</strong>.
            </p>

            {/* Sanction Particulars Table */}
            <div className="my-3 border border-slate-300 rounded-xl overflow-hidden text-xs">
              <table className="w-full">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50">
                    <td className="py-2.5 px-4 font-bold w-1/2">Sanctioned Grant Amount</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-800 font-mono text-sm">
                      ₹{amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold">Cheque / Disbursal Payee</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {app.chequeInFavourOf || app.collegeName}
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="py-2.5 px-4 font-bold">Cheque / Reference Number</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {app.chequeNumber ? `#${app.chequeNumber}` : 'DIRECT DISBURSAL'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold">Academic Cycle</td>
                    <td className="py-2.5 px-4 font-semibold">2026 – 2027</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              This scholarship amount has been earmarked exclusively toward your institutional tuition fees and is disbursed in favor of your college/university.
            </p>

            <p>
              We congratulate you on your achievements and wish you continued excellence in your academic career.
            </p>
          </div>

          {/* Signatories */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="font-serif italic font-bold text-slate-900 text-sm">Zaid Ahmed</div>
              <div className="border-t border-slate-400 w-32 my-1"></div>
              <p className="font-bold text-slate-800">Administrator</p>
              <p className="text-slate-500 text-[11px]">Humane Touch Trust</p>
            </div>

            <div className="text-right">
              <div className="font-serif italic font-bold text-slate-900 text-sm">Tazaiyun Oomer</div>
              <div className="border-t border-slate-400 w-32 ml-auto my-1"></div>
              <p className="font-bold text-slate-800">Secretary & Trustee</p>
              <p className="text-slate-500 text-[11px]">Board of Trustees</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}