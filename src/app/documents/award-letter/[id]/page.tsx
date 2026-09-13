import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/documents/PrintButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AwardLetterPage({ params }: Props) {
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

  const amount = application.sanctionedAmount || application.annualTuitionFee || 0;

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:py-0 flex flex-col items-center">
      
      {/* Top Action Bar */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6 px-4 print:hidden">
        <span className="text-xs font-bold text-slate-600 font-mono">
          Ref ID: {application.referenceNumber || 'HT/SANCTION/2026'}
        </span>
        <PrintButton />
      </div>

      {/* Formal Letter Sheet (A4 Portrait) */}
      <div className="w-full max-w-3xl bg-white border border-slate-300 p-12 shadow-xl print:shadow-none print:border-none relative text-slate-900 font-sans leading-relaxed text-xs sm:text-sm">
        
        {/* Letterhead */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              Humane Touch Trust
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

        {/* Date and Reference */}
        <div className="flex justify-between items-center mb-6 text-xs font-semibold">
          <div>
            <strong>Sanction Ref:</strong> <span className="font-mono text-amber-800">{application.referenceNumber || 'HT/2026/DISBURSAL'}</span>
          </div>
          <div>
            <strong>Date:</strong> {issueDate}
          </div>
        </div>

        {/* To Address */}
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <p className="font-bold text-slate-800">To,</p>
          <p className="font-black text-slate-900 text-sm">{student.fullName}</p>
          <p className="text-slate-600">Student Scholar, Phone: {student.phone}</p>
          <p className="text-slate-600">Enrolled Course: {application.courseName}</p>
          <p className="text-slate-600">Institution: {application.collegeName}</p>
        </div>

        {/* Subject */}
        <div className="mb-6 font-bold text-slate-900 underline">
          Subject: Sanction of Humane Touch Udaan Higher Education Scholarship
        </div>

        {/* Body */}
        <div className="space-y-4 text-justify">
          <p>Dear <strong>{student.fullName}</strong>,</p>

          <p>
            We take pleasure in informing you that following the thorough verification of your academic records and evaluation by our Board of Trustees, the Humane Touch Trust has approved your financial scholarship grant under the <strong>Udaan Higher Education Support Initiative</strong>.
          </p>

          {/* Sanction Particulars Table */}
          <div className="my-4 border border-slate-300 rounded-xl overflow-hidden text-xs">
            <table className="w-full">
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-slate-50">
                  <td className="py-2.5 px-4 font-bold w-1/2">Sanctioned Scholarship Amount</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-800 font-mono text-sm">
                    ₹{amount.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold">Cheque / Disbursal Payee</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">
                    {application.chequeInFavourOf || application.collegeName}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-2.5 px-4 font-bold">Cheque / Transaction Reference</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                    {application.chequeNumber ? `#${application.chequeNumber}` : 'DIRECT COLLEGE DISBURSAL'}
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
            This scholarship amount has been earmarked exclusively toward your institutional tuition fees and is disbursed directly in favor of your college/university.
          </p>

          <p>
            We congratulate you on your achievements and wish you continued excellence in your academic career.
          </p>
        </div>

        {/* Signature Blocks */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
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
  );
}