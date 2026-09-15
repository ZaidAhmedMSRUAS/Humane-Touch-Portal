"use client";

import React from "react";

export interface AwardLetterData {
  referenceNumber: string;
  date: string;
  studentName: string;
  usn: string;
  course: string;
  collegeName: string;
  academicYear: string;
  sanctionedAmount: number;
  paymentMode?: string;
  disbursementDetails?: string;
  trusteeSignatoryName?: string;
}

interface AwardLetterProps {
  data: AwardLetterData;
  onPrint?: () => void;
  showPrintButton?: boolean;
}

export const AwardLetterTemplate: React.FC<AwardLetterProps> = ({
  data,
  onPrint,
  showPrintButton = true,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(data.sanctionedAmount);

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Action Bar (Hidden in Print) */}
      {showPrintButton && (
        <div className="w-full max-w-3xl mb-4 flex justify-end gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print / Save as PDF
          </button>
        </div>
      )}

      {/* Letter Sheet */}
      <div className="w-full max-w-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-xl text-slate-800 letter-printable text-sm leading-relaxed font-sans">
        {/* Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">
              Humane Touch
            </h1>
            <p className="text-xs text-slate-500">Charitable Trust for Educational Empowerment</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Email: contact@humanetouch.org</p>
            <p>Web: www.humanetouch.org</p>
          </div>
        </div>

        {/* Ref and Date */}
        <div className="flex justify-between items-center mt-6 text-xs text-slate-600">
          <p><strong className="text-slate-800">Ref No:</strong> {data.referenceNumber}</p>
          <p><strong className="text-slate-800">Date:</strong> {data.date}</p>
        </div>

        {/* Addressee */}
        <div className="mt-6 space-y-0.5">
          <p className="text-slate-600">To,</p>
          <p className="font-bold text-slate-900">{data.studentName}</p>
          <p>USN / Reg: {data.usn}</p>
          <p>{data.course}</p>
          <p>{data.collegeName}</p>
        </div>

        {/* Subject */}
        <div className="mt-6 py-2 px-3 bg-slate-50 border-l-4 border-indigo-600 font-semibold text-slate-900">
          Subject: Official Sanction Letter for Educational Scholarship ({data.academicYear})
        </div>

        {/* Letter Body */}
        <div className="mt-6 space-y-4 text-slate-700 text-justify">
          <p>Dear <strong>{data.studentName}</strong>,</p>
          <p>
            We are pleased to inform you that following the review of your academic performance and background, the Board of Trustees has approved your scholarship application for the academic year <strong>{data.academicYear}</strong>.
          </p>
          <p>
            An educational grant of <strong className="text-slate-900 font-semibold">{formattedAmount}</strong> has been sanctioned towards your course fees for <strong>{data.course}</strong> at <strong>{data.collegeName}</strong>.
          </p>

          <div className="my-4 p-4 border border-slate-200 rounded-md bg-slate-50/50 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-500">Sanctioned Amount:</span>
              <span className="font-bold text-slate-900">{formattedAmount}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-500">Disbursement Channel:</span>
              <span className="font-medium text-slate-800">{data.paymentMode || "Direct Institution Transfer / Cheque"}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            <strong>Terms:</strong> This scholarship is awarded on the condition of maintaining continuous academic progress and code of conduct.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-6 flex justify-between items-end">
          <div className="text-xs text-slate-500 space-y-1">
            <p>Seal of the Trust</p>
            <div className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
              SEAL
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="border-b border-slate-600 w-40 ml-auto mb-1" />
            <p className="font-bold text-slate-900">{data.trusteeSignatoryName || "Authorized Signatory"}</p>
            <p className="text-xs text-slate-500">Board of Trustees, Humane Touch</p>
          </div>
        </div>
      </div>
    </div>
  );
};