'use client';
import React, { useState } from 'react';

interface CertificateProps {
  application: any;
  onClose: () => void;
}

export default function CertificatePDF({ application, onClose }: CertificateProps) {
  const [downloading, setDownloading] = useState(false);

  // Dynamic candidate details
  const studentName = application?.student?.fullName || application?.fullName || 'RUQIYA KHANUM';
  const courseName = application?.courseName || application?.course || 'B.Tech.';
  const yearOfStudy = application?.currentYearOfStudy || '3rd Year';
  const collegeName = application?.collegeName || application?.college || 'Bengaluru University / Institution';
  const refNumber = application?.referenceNumber || `HT/26-27/${application?.id ? application.id.slice(0, 4).toUpperCase() : '0001'}`;

  // Formatted date generator
  const getFormattedDate = () => {
    const d = new Date();
    const day = d.getDate();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
        ? 'rd'
        : 'th';
    const month = d.toLocaleDateString('en-IN', { month: 'long' });
    const year = d.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const awardDate = getFormattedDate();

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

      const element = document.getElementById('printable-certificate');
      
      const opt = {
        margin: 0,
        filename: `Udaan_Certificate_${studentName.replace(/\s+/g, '_')}_${refNumber.replace(/\//g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'landscape',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await (window as any).html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Certificate PDF generation failed, falling back to print dialog:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      
      {/* Strict 1-Page A4 Landscape Print Engine */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0mm;
          }
          body {
            visibility: hidden;
            background: #ffffff !important;
          }
          #certificate-render-wrapper {
            visibility: visible;
            position: fixed;
            left: 0;
            top: 0;
            width: 297mm;
            height: 210mm;
            margin: 0;
            padding: 0;
          }
          #printable-certificate {
            width: 297mm !important;
            height: 210mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-slate-200">
        
        {/* Modal Toolbar */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Udaan Certificate of Accomplishment
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Academic Excellence Commendation • Ref: <span className="font-mono font-bold text-amber-700">{refNumber}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Certificate Display Canvas */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-900 flex justify-center items-center">
          
          <div id="certificate-render-wrapper" className="flex justify-center items-center">
            
            {/* Fixed A4 Landscape Canvas (1050px x 742px) */}
            <div 
              id="printable-certificate"
              className="relative bg-[#071126] p-8 overflow-hidden select-none flex flex-col justify-between text-slate-800"
              style={{
                width: '1050px',
                height: '742px',
                minWidth: '1050px',
                minHeight: '742px',
                maxWidth: '1050px',
                maxHeight: '742px',
                boxSizing: 'border-box',
              }}
            >
              {/* Outer Metallic Gold Borders */}
              <div className="absolute inset-3 border-2 border-amber-400/40 rounded-sm pointer-events-none z-0" />
              <div className="absolute inset-4 border border-amber-300/20 rounded-sm pointer-events-none z-0" />
              
              {/* Geometric Corner Brackets */}
              <div className="absolute top-3 left-3 w-10 h-10 border-t-4 border-l-4 border-amber-400 pointer-events-none z-0" />
              <div className="absolute top-3 right-3 w-10 h-10 border-t-4 border-r-4 border-amber-400 pointer-events-none z-0" />
              <div className="absolute bottom-3 left-3 w-10 h-10 border-b-4 border-l-4 border-amber-400 pointer-events-none z-0" />
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-4 border-r-4 border-amber-400 pointer-events-none z-0" />

              {/* Inner Ivory Parchment Plate */}
              <div className="relative w-full h-full bg-gradient-to-b from-[#FFFDF9] via-[#FAF7EE] to-[#F7F2E4] p-8 sm:p-10 flex flex-col justify-between shadow-2xl z-10 border border-amber-200/80">
                
                {/* Background Guilloche Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                  <svg className="w-[520px] h-[520px]" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="2,2" />
                    <circle cx="100" cy="100" r="75" fill="none" stroke="#000" strokeWidth="1" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="#000" strokeWidth="1.5" strokeDasharray="4,2" />
                    <path d="M 100 10 L 100 190 M 10 100 L 190 100 M 36 36 L 164 164 M 36 164 L 164 36" stroke="#000" strokeWidth="0.5" />
                  </svg>
                </div>

                {/* 1. Header: Dual Official Logos */}
                <div className="flex justify-between items-center relative z-10 border-b border-amber-900/10 pb-4">
                  
                  {/* Left: Humane Touch Logo */}
                  <div className="flex items-center">
                    <img 
                      src="/logo.png" 
                      alt="Humane Touch" 
                      className="h-16 w-auto object-contain max-w-[210px]"
                    />
                  </div>

                  {/* Center: Award Authority Title */}
                  <div className="text-center space-y-0.5">
                    <span className="px-3.5 py-1 bg-amber-500/15 text-amber-900 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/30 inline-block font-sans">
                      HUMANE TOUCH TRUST • ESTD. 1999
                    </span>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                      Higher Education Scholarship Council
                    </p>
                  </div>

                  {/* Right: Udaan Scholarship Logo */}
                  <div className="flex items-center">
                    <img 
                      src="/Udaan Scholarship.png" 
                      alt="Udaan Scholarship" 
                      className="h-16 w-auto object-contain max-w-[210px]"
                    />
                  </div>
                </div>

                {/* 2. Main Body & Citation */}
                <div className="space-y-3.5 my-auto text-center relative z-10">
                  
                  <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-900 uppercase">
                      Certificate of Accomplishment
                    </h1>
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-16 h-[1.5px] bg-gradient-to-r from-transparent to-amber-500"></div>
                      <span className="text-[11px] font-bold text-amber-800 tracking-[0.2em] uppercase font-sans">
                        UDAAN SCHOLARSHIP 2026–27
                      </span>
                      <div className="w-16 h-[1.5px] bg-gradient-to-l from-transparent to-amber-500"></div>
                    </div>
                  </div>

                  <p className="text-xs font-serif italic text-slate-600">
                    This prestigious commendation is officially conferred upon
                  </p>

                  {/* Candidate Name Presentation */}
                  <div className="max-w-xl mx-auto py-1">
                    <h2 className="text-3xl font-serif font-extrabold text-[#0f172a] uppercase tracking-wide border-b-2 border-amber-500/60 pb-1 inline-block px-6">
                      {studentName}
                    </h2>
                  </div>

                  {/* Degree, Year & Institution */}
                  <div>
                    <span className="text-base font-sans font-bold text-amber-950">
                      {courseName} • {yearOfStudy}
                    </span>
                    <p className="text-xs font-sans text-slate-500 font-medium mt-0.5">
                      {collegeName}
                    </p>
                  </div>

                  {/* Citation */}
                  <p className="text-xs text-slate-700 max-w-2xl mx-auto leading-relaxed font-serif px-6 pt-1">
                    in recognition of exceptional academic merit, outstanding character, and dedication toward higher learning, having successfully qualified for educational financial sponsorship on this <strong>{awardDate}</strong>.
                  </p>
                </div>

                {/* 3. Footer: Seal, Ref ID, & Secretary Signature */}
                <div className="flex justify-between items-end relative z-10 pt-3 border-t border-amber-900/10">
                  
                  {/* Left: Official Gold Foil Seal & Verification */}
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 p-[2px] shadow-md flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#071126] border border-amber-200/40 flex flex-col items-center justify-center text-center p-1 text-amber-300">
                        <span className="text-[7px] font-black uppercase tracking-tight text-amber-200">HUMANE TOUCH</span>
                        <span className="text-[10px] select-none">★ 🏛️ ★</span>
                        <span className="text-[6px] font-black uppercase tracking-widest text-amber-400">SEAL</span>
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                      <p className="font-bold text-slate-800">REF: {refNumber}</p>
                      <p>VERIFIED SCHOLAR</p>
                      <p className="text-[9px] text-emerald-700 font-sans font-bold">● Sanction Approved</p>
                    </div>
                  </div>

                  {/* Center: Quote */}
                  <div className="text-center hidden sm:block">
                    <p className="text-[10px] font-serif italic text-slate-400 max-w-xs leading-tight">
                      "Empowering deserving minds through human dignity and educational excellence."
                    </p>
                  </div>

                  {/* Right: Secretary Signature */}
                  <div className="text-center min-w-[200px]">
                    <div 
                      className="text-2xl sm:text-3xl font-serif italic text-slate-900 select-none pb-0.5"
                      style={{ fontFamily: 'Brush Script MT, cursive, Georgia, serif' }}
                    >
                      Tazaiyun Oomer
                    </div>
                    <div className="w-44 border-t-2 border-slate-900/70 my-0.5 mx-auto"></div>
                    <p className="text-xs font-sans font-black text-slate-900 tracking-wider uppercase">
                      Tazaiyun Oomer
                    </p>
                    <p className="text-[10px] font-sans font-bold text-amber-800">
                      Secretary • Board of Trustees
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Certificate for <strong>{studentName}</strong> calibrated for single-page A4 landscape download.
          </p>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              🖨️ Print Certificate
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{downloading ? 'Rendering PDF...' : '🎖️ Download Certificate (PDF)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}