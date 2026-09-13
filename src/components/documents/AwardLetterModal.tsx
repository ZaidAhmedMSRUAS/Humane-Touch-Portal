'use client';
import React from 'react';

interface Props {
  app: any;
  onClose: () => void;
}

// Convert amount to Indian words format
function numberToWords(num: number): string {
  if (!num || isNaN(num)) return 'Zero';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim();
}

export default function AwardLetterModal({ app, onClose }: Props) {
  if (!app) return null;

  const studentName = app.student?.fullName || app.studentName || 'Zaid Ahmed';
  const course = app.courseName || 'B. Tech';
  const year = app.currentYearOfStudy || '1st Year';
  const college = app.collegeName || 'MSRUAS';
  const amount = Number(app.sanctionedAmount || app.annualTuitionFee || 50000);
  const chequeNumber = app.chequeNumber || '990256';
  const chequeInFavourOf = app.chequeInFavourOf || college;
  const refNumber = app.referenceNumber || 'HT/26-27/0001';

  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-4 my-6 print:my-0 print:p-0 print:shadow-none print:max-w-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 print:hidden">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            Official Award Sanction Letter
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
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

        {/* Letter Sheet (Faithful Replica) */}
        <div className="w-full bg-white border border-slate-300 p-8 sm:p-12 shadow-sm print:shadow-none print:border-none text-slate-900 font-sans text-xs sm:text-[13px] leading-relaxed">
          
          {/* Top Bar: Ref & Date */}
          <div className="flex justify-between items-start mb-4">
            <span className="font-mono font-bold text-slate-800">
              Ref: {refNumber}
            </span>
            <span className="font-semibold text-slate-700">
              Date: {issueDate}
            </span>
          </div>

          {/* Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-6">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
              ESTD. 1999 REGD. PUBLIC CHARITABLE TRUST
            </p>
            <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight mt-0.5">
              HUMANE TOUCH TRUST
            </h1>
            <p className="text-[11px] font-semibold text-slate-700">
              Bengaluru, Karnataka, India • Udaan Higher Education Scholarship Program
            </p>
          </div>

          {/* To Address */}
          <div className="mb-6 space-y-0.5">
            <p className="font-bold text-slate-900">To,</p>
            <p className="font-semibold text-slate-800">The Principal / Accounts Department,</p>
            <p className="font-bold text-slate-900">{college}</p>
            <p className="text-slate-600">Bengaluru, Karnataka</p>
          </div>

          {/* Subject */}
          <div className="mb-4 font-bold text-slate-950 uppercase tracking-tight underline">
            SUBJECT: GRANT SANCTION & DIRECT CHEQUE DISBURSAL FOR UDAAN SCHOLARSHIP
          </div>

          {/* Salutation & Opening */}
          <p className="mb-3 font-semibold text-slate-900">Dear Sir/Madam,</p>
          <p className="mb-4 text-justify">
            We have the pleasure to inform you that Humane Touch Trust has approved a higher education scholarship grant under the <strong>Udaan Scholarship Program</strong> for the following candidate:
          </p>

          {/* Candidate & Disbursal Table */}
          <div className="my-4 border border-slate-400 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs sm:text-[12px]">
              <tbody className="divide-y divide-slate-300">
                <tr className="bg-slate-50/70">
                  <td className="py-2.5 px-4 font-bold w-48 border-r border-slate-300 text-slate-900">Student Name:</td>
                  <td className="py-2.5 px-4 font-bold text-slate-950">{studentName}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold border-r border-slate-300 text-slate-900">Course & Year:</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{course} ({year})</td>
                </tr>
                <tr className="bg-slate-50/70">
                  <td className="py-2.5 px-4 font-bold border-r border-slate-300 text-slate-900">Sanctioned Amount:</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-900 font-mono">
                    ₹ {amount.toLocaleString('en-IN')} (Rupees {numberToWords(amount)} Only)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold border-r border-slate-300 text-slate-900">Cheque In Favour Of:</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{chequeInFavourOf}</td>
                </tr>
                <tr className="bg-slate-50/70">
                  <td className="py-2.5 px-4 font-bold border-r border-slate-300 text-slate-900">Cheque / Ref Number:</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{chequeNumber}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Closing Terms */}
          <p className="my-4 text-justify">
            This grant has been sanctioned following in-person document scrutiny and a personal interview conducted by the Trustees. The funds are to be adjusted exclusively toward the academic tuition fees of <strong>{studentName}</strong> for the academic year 2026-27.
          </p>

          <p className="mb-8">Kindly acknowledge receipt of the instrument.</p>

          {/* Signatory & Trust Seal */}
          <div className="pt-6 flex justify-between items-end">
            <div className="space-y-0.5">
              <div className="font-serif italic font-bold text-slate-900 text-sm">Tazaiyun Oomer</div>
              <div className="border-t border-slate-400 w-36 my-1"></div>
              <p className="font-bold text-slate-950 text-xs">Tazaiyun Oomer</p>
              <p className="text-[11px] text-slate-700 font-semibold">Secretary / Authorized Signatory</p>
              <p className="text-[10px] text-slate-500">Humane Touch Trust</p>
            </div>

            <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-600/80 flex flex-col items-center justify-center text-center p-1 text-amber-900 font-black">
              <span className="text-[7px] uppercase tracking-tighter">Humane Touch</span>
              <span className="text-[8px] uppercase">Trust Seal</span>
              <span className="text-[7px] font-mono">1999</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}