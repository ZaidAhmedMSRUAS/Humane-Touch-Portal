import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/documents/PrintButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({ params }: Props) {
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      student: true,
    },
  });

  if (!application) {
    notFound();
  }

  const student = application.student;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:py-0 flex flex-col items-center">
      
      {/* Top Action Bar (Hidden when printing) */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 px-4 print:hidden">
        <span className="text-xs font-bold text-slate-600 font-mono">
          Ref ID: {application.referenceNumber || 'HT/2026/AWARD'}
        </span>
        <PrintButton />
      </div>

      {/* Certificate Sheet (A4 Landscape Formatted) */}
      <div className="w-full max-w-4xl bg-white border-[12px] border-double border-amber-600 p-12 rounded-3xl shadow-2xl print:shadow-none print:border-8 print:border-amber-700 print:rounded-none relative text-center">
        
        {/* Decorative Corner Ornaments */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600"></div>
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600"></div>
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600"></div>
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600"></div>

        {/* Header */}
        <div className="space-y-1 mb-6">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-amber-700">
            Humane Touch Trust (Regd.)
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Empowering Higher Education Through Udaan Scholarship Program
          </p>
          <div className="w-24 h-0.5 bg-amber-500 mx-auto my-3"></div>
        </div>

        {/* Certificate Title */}
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-serif uppercase my-4">
          Certificate of Accomplishment
        </h1>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          This is to proudly certify that
        </p>

        {/* Student Name */}
        <div className="my-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif border-b-2 border-slate-300 inline-block px-8 pb-1">
            {student.fullName}
          </h2>
        </div>

        {/* Award Body */}
        <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed">
          has been conferred the prestigious <strong className="text-amber-800">Humane Touch Udaan Scholarship</strong> in recognition of academic excellence and commitment towards pursuing{' '}
          <strong className="text-slate-900">{application.courseName}</strong> at{' '}
          <strong className="text-slate-900">{application.collegeName}</strong> for the academic cycle.
        </p>

        {/* Reference & Amount Badge */}
        <div className="my-8 flex justify-center items-center gap-6 text-xs">
          <div className="bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-xl font-mono font-bold text-amber-900">
            Sanction Ref: {application.referenceNumber || 'HT/2026/AWARD'}
          </div>
          {application.sanctionedAmount && (
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-xl font-mono font-bold text-emerald-900">
              Award Amount: ₹{application.sanctionedAmount.toLocaleString('en-IN')}
            </div>
          )}
        </div>

        {/* Signatories & Date Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-3 items-end text-xs">
          <div className="text-left">
            <p className="text-slate-400 text-[10px]">Date of Conferment</p>
            <p className="font-bold text-slate-800 mt-1">{issueDate}</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-500 mx-auto flex items-center justify-center text-[10px] font-black text-amber-700 uppercase">
              Trust Seal
            </div>
          </div>

          <div className="text-right">
            <div className="font-serif italic font-bold text-slate-900 text-sm">Tazaiyun Oomer</div>
            <div className="border-t border-slate-400 w-36 ml-auto my-1"></div>
            <p className="font-bold text-[11px] text-slate-700">Secretary & Trustee</p>
            <p className="text-[10px] text-slate-400">Humane Touch Trust</p>
          </div>
        </div>

      </div>
    </div>
  );
}