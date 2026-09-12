'use client';
import React from 'react';

interface ApplicationDocumentsModalProps {
  application: any;
  onClose: () => void;
}

export default function ApplicationDocumentsModal({ application, onClose }: ApplicationDocumentsModalProps) {
  const docs = [
    { label: '10th / SSLC Marksheet', url: application.marksheet10Url || application.marksheet10 },
    { label: '12th / PUC Marksheet', url: application.marksheet12Url || application.marksheet12 },
    { label: 'Latest College Sem Marksheet', url: application.latestMarksheetUrl || application.collegeMarksheet },
    { label: 'College Tuition Fee Receipt / Demand Note', url: application.feeReceiptUrl || application.feeReceipt },
    { label: 'Income Certificate / BPL Card', url: application.incomeCertUrl || application.incomeCertificate },
    { label: 'Aadhaar Card Copy', url: application.aadhaarCardUrl || application.aadhaarCard },
    { label: 'Electricity / Rent Agreement', url: application.electricityBillUrl || application.electricityBill },
    { label: 'Student Photograph', url: application.passportPhotoUrl || application.passportPhoto },
  ].filter((d) => Boolean(d.url));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Document Verification Vault</span>
            <h3 className="text-xl font-bold">{application.student?.fullName || application.fullName || 'Student'}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Ref: {application.referenceNumber || 'N/A'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold">
            ✕
          </button>
        </div>

        {/* Document Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
          {docs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <span className="text-4xl block mb-2">📁</span>
              <p className="font-bold">No uploaded documents found for this candidate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {docs.map((doc, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
                      📄
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{doc.label}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 truncate max-w-[180px]">
                        {doc.url.split('/').pop()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                    >
                      👁️ View Document
                    </a>
                    <a
                      href={doc.url}
                      download
                      className="py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl transition"
                    >
                      ⬇️
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Total Uploads: <strong>{docs.length} verified files</strong></span>
          <button onClick={onClose} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 font-bold rounded-xl text-slate-800">
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
}