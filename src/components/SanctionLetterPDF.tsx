'use client';
import React, { useState } from 'react';

interface LetterProps {
  application: any;
  onClose: () => void;
}

export default function SanctionLetterPDF({ application, onClose }: LetterProps) {
  const [downloading, setDownloading] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const refNumber = application.referenceNumber || `HT/26-27/${application.id ? application.id.slice(0, 4).toUpperCase() : '001'}`;
  const studentName = application.student?.fullName || application.fullName || 'Scholarship Recipient';
  const collegeName = application.collegeName || application.college || 'Institution';
  const courseName = application.courseName || application.course || 'Degree Program';
  const yearOfStudy = application.currentYearOfStudy || 'Current Academic Year';
  const sanctionAmount = Number(application.sanctionedAmount || application.annualTuitionFee || 0);
  const chequePayee = application.chequeInFavourOf || application.verificationReport?.chequePayeeVerified || collegeName;
  const chequeNumber = application.chequeNumber || 'Pending Admin Entry';

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      if (!(window as any).html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const element = document.getElementById('printable-sanction-letter');
      if (!element) {
        throw new Error('Printable sanction letter element was not found');
      }

      const safeStudentName = studentName.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
      const safeRefNumber = refNumber.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
      
      const opt = {
        margin: 0, // Zero margin to prevent top white space offset
        filename: `HumaneTouch_Award_Letter_${safeStudentName || 'Scholarship_Recipient'}_${safeRefNumber || 'Reference'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2.5, 
          useCORS: true, 
          logging: false, 
          scrollY: 0, 
          scrollX: 0 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await (window as any).html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation failed, falling back to print dialog:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      
      {/* 1-Page A4 Portrait Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          body {
            visibility: hidden;
            background: #ffffff !important;
          }
          #printable-letter-wrapper {
            visibility: visible;
            position: fixed;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
          }
          #printable-sanction-letter {
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-slate-200">
        
        {/* Toolbar */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Scholarship Sanction Award Letter</h3>
            <p className="text-[11px] text-slate-500 font-mono">Ref ID: {refNumber}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Letter Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/90 flex justify-center items-center">
          
          <div id="printable-letter-wrapper" className="flex justify-center items-center">
            
            {/* Fixed A4 Portrait Canvas (794px x 1120px) */}
            <div 
              id="printable-sanction-letter" 
              className="bg-white px-10 py-8 shadow-2xl border border-slate-200 relative text-slate-800 font-serif leading-relaxed text-xs sm:text-[13px] flex flex-col justify-between select-none"
              style={{
                width: '794px',
                height: '1120px',
                minWidth: '794px',
                minHeight: '1120px',
                maxWidth: '794px',
                maxHeight: '1120px',
                boxSizing: 'border-box',
                margin: 0,
              }}
            >
              {/* Subtle Watermark */}
              <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-[0.03] pointer-events-none select-none"
                style={{ backgroundImage: "url('/banner.jpeg')" }}
              />

              {/* TOP WRAPPER: Keeps Letterhead and Letter Body unified without unwanted vertical gap */}
              <div>
                {/* 1. Letterhead - Flush at top */}
                <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1.5 relative z-10">
                  <div className="flex justify-center mb-1">
                    <img src="/logo.png" alt="Humane Touch" className="h-11 object-contain" />
                  </div>
                  <div className="inline-block px-3 py-0.5 bg-slate-900 text-amber-400 text-[9px] font-sans font-bold uppercase tracking-widest rounded-full">
                    Estd. 1999 • Regd. Public Charitable Trust
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans">
                    HUMANE TOUCH TRUST
                  </h1>
                  <p className="text-[11px] text-slate-600 font-sans">
                    Bengaluru, Karnataka, India • Udaan Higher Education Scholarship Program
                  </p>
                  <div className="flex justify-between items-center pt-2 text-[11px] font-mono text-slate-600 border-t border-slate-100 font-sans">
                    <span><strong>Ref:</strong> {refNumber}</span>
                    <span><strong>Date:</strong> {currentDate}</span>
                  </div>
                </div>

                {/* 2. Letter Body (Attached closely with mt-4) */}
                <div className="space-y-3 relative z-10 mt-4">
                  <div>
                    <p className="font-sans font-bold text-slate-900 text-xs">To,</p>
                    <p className="font-sans text-xs">The Principal / Accounts Department,</p>
                    <p className="font-bold text-slate-900 text-xs font-sans">{collegeName}</p>
                    <p className="text-slate-500 text-[11px] font-sans">Bengaluru, Karnataka</p>
                  </div>

                  <div>
                    <p className="font-sans font-bold text-slate-900 uppercase text-xs bg-slate-50 p-2 border-l-4 border-amber-500">
                      Subject: Grant Sanction & Direct Cheque Disbursal for Udaan Scholarship
                    </p>
                  </div>

                  <p className="text-xs">Dear Sir / Madam,</p>

                  <p className="text-xs">
                    We have the pleasure to inform you that <strong>Humane Touch Trust</strong> has approved a higher education scholarship grant under the <strong>Udaan Scholarship Program</strong> for the following candidate:
                  </p>

                  {/* Sanction Details Table */}
                  <div className="my-2 border border-slate-300 rounded overflow-hidden font-sans text-xs">
                    <div className="grid grid-cols-3 bg-slate-50 p-2 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold">Student Name:</span>
                      <span className="col-span-2 font-bold text-slate-900">{studentName}</span>
                    </div>
                    <div className="grid grid-cols-3 p-2 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold">Course & Year:</span>
                      <span className="col-span-2 font-semibold text-slate-800">{courseName} ({yearOfStudy})</span>
                    </div>
                    <div className="grid grid-cols-3 bg-slate-50 p-2 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold">Sanctioned Amount:</span>
                      <span className="col-span-2 font-black text-amber-600 text-sm">
                        ₹{sanctionAmount.toLocaleString('en-IN')} (Rupees {sanctionAmount.toLocaleString('en-IN')} Only)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-2 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold">Cheque In Favour Of:</span>
                      <span className="col-span-2 font-bold text-slate-900">{chequePayee}</span>
                    </div>
                    <div className="grid grid-cols-3 bg-amber-50/60 p-2">
                      <span className="text-slate-600 font-bold">Cheque / Ref Number:</span>
                      <span className="col-span-2 font-black text-slate-900 font-mono tracking-wider text-xs">
                        {chequeNumber}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs">
                    This grant has been sanctioned following in-person document scrutiny and a personal interview conducted by the Trustees. The funds are to be adjusted exclusively toward the academic tuition fees of <strong>{studentName}</strong> for the academic year 2026–27.
                  </p>

                  <p className="text-xs">
                    Kindly acknowledge receipt of the instrument.
                  </p>
                </div>
              </div>

              {/* 3. Signatures & Seal (Pinned to bottom of the single page) */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-end font-sans relative z-10 mt-4">
                <div>
                  <div 
                    className="text-2xl font-serif italic text-slate-900 select-none pb-0.5"
                    style={{ fontFamily: 'Brush Script MT, cursive, Georgia, serif' }}
                  >
                    Tazaiyun Oomer
                  </div>
                  <p className="font-bold text-xs text-slate-900">Secretary / Authorized Signatory</p>
                  <p className="text-[10px] text-slate-500">Humane Touch Trust</p>
                </div>

                <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center text-center p-1 select-none">
                  <span className="text-[8px] font-black uppercase text-slate-900 tracking-tighter leading-none">HUMANE TOUCH</span>
                  <span className="text-[7px] text-amber-600 font-bold my-0.5">TRUST SEAL</span>
                  <span className="text-[7px] font-mono text-slate-500">1999</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left font-mono">
            Official Award Ref: {refNumber}
          </p>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{downloading ? 'Generating PDF...' : '📥 Download Award Letter (PDF)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}