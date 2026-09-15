"use client";

import React from "react";
import Image from "next/image";

export interface CertificateData {
  certificateId: string;
  studentName: string;
  usn: string;
  collegeName: string;
  course: string;
  yearOfStudy?: string;
  academicYear: string;
  scholarshipScheme: string;
  awardedDate: string;
  managingTrusteeName?: string;
  presidentName?: string;
  organizationName?: string;
}

interface CertificateProps {
  data: CertificateData;
  onPrint?: () => void;
  showPrintButton?: boolean;
}

export const CertificateTemplate: React.FC<CertificateProps> = ({
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

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Action Bar (Hidden in Print) */}
      {showPrintButton && (
        <div className="w-full max-w-4xl mb-4 flex justify-end gap-3 print:hidden">
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

      {/* Certificate Frame */}
      <div className="w-full max-w-4xl bg-amber-50/40 border-[12px] border-double border-slate-800 p-8 md:p-12 shadow-2xl relative text-slate-800 certificate-printable font-serif">
        {/* Decorative Inner Border */}
        <div className="border border-amber-600/40 p-6 md:p-8 relative">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider uppercase text-slate-900 font-sans">
              {data.organizationName || "HUMANE TOUCH TRUST"}
            </h2>
            <p className="text-xs uppercase tracking-widest text-amber-700 font-semibold font-sans">
              Empowering Education • Fostering Excellence
            </p>
            <div className="w-24 h-0.5 bg-amber-600 mx-auto my-3" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 pt-2 font-serif italic">
              Certificate of Scholarship Award
            </h1>
          </div>

          {/* Body Section */}
          <div className="mt-8 text-center space-y-6 text-slate-700 leading-relaxed">
            <p className="text-base sm:text-lg">
              This is proudly presented to
            </p>

            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-indigo-950 underline decoration-amber-500 decoration-2 underline-offset-8 block">
                {data.studentName}
              </span>
              <p className="text-sm font-sans text-slate-500 pt-2">
                USN / Reg No: <span className="font-semibold text-slate-800">{data.usn}</span>
              </p>
            </div>

            <p className="text-sm sm:text-base max-w-2xl mx-auto">
              in recognition of academic merit, dedication, and character, officially conferring the{" "}
              <strong className="text-slate-900 font-semibold">{data.scholarshipScheme}</strong> for{" "}
              <strong className="text-slate-900 font-semibold">{data.course}</strong> at{" "}
              <strong className="text-slate-900 font-semibold">{data.collegeName}</strong> for the academic year{" "}
              <strong className="text-slate-900 font-semibold">{data.academicYear}</strong>.
            </p>
          </div>

          {/* Signatures & Seal Section */}
          <div className="mt-14 pt-6 grid grid-cols-3 items-end text-center font-sans text-xs sm:text-sm">
            {/* Date / ID */}
            <div className="text-left space-y-1">
              <p className="text-slate-500">Date: <span className="text-slate-800 font-medium">{data.awardedDate}</span></p>
              <p className="text-slate-500">Certificate ID: <span className="text-slate-800 font-mono font-medium">{data.certificateId}</span></p>
            </div>

            {/* Official Seal / Crest */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-amber-600 flex items-center justify-center text-[10px] text-amber-800 uppercase font-semibold text-center p-1 bg-amber-100/50">
                Official Trust Seal
              </div>
            </div>

            {/* Managing Trustee Signature */}
            <div className="space-y-1 text-right">
              <div className="border-b border-slate-700 w-36 ml-auto mb-1" />
              <p className="font-bold text-slate-900">{data.managingTrusteeName || "Managing Trustee"}</p>
              <p className="text-slate-500 text-xs">Humane Touch</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};