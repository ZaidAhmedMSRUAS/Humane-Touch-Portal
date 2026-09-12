'use client';
import React from 'react';
import GeotagMap from './GeotagMap';

interface DossierProps {
  application: any;
  onSanctionDecision: (appId: string, amount: number, decision: 'APPROVE' | 'REJECT') => void;
}

export default function DossierViewer({ application, onSanctionDecision }: DossierProps) {
  const [sanctionAmt, setSanctionAmt] = React.useState<number>(
    Number(application.sanctionedAmount) || Number(application.annualTuitionFee)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-sky-600 uppercase bg-sky-50 px-2.5 py-1 rounded">
            App ID: {application.id.slice(0, 8)}
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{application.student?.fullName}</h2>
          <p className="text-xs text-slate-500">
            {application.courseName} ({application.currentYearOfStudy}) • {application.collegeName}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Total Requested Tuition</span>
          <p className="text-2xl font-black text-slate-900">
            ₹{Number(application.annualTuitionFee).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Academic & Personal Data */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Candidate Profile</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400">Previous Score</p>
              <p className="font-bold text-slate-800 text-sm">{application.previousScoreMarks}%</p>
            </div>
            <div>
              <p className="text-slate-400">Family Income</p>
              <p className="font-bold text-slate-800 text-sm">
                ₹{Number(application.familyAnnualIncome).toLocaleString('en-IN')}/yr
              </p>
            </div>
            <div>
              <p className="text-slate-400">Household Category</p>
              <p className="font-semibold text-slate-700">{application.householdCategory}</p>
            </div>
            <div>
              <p className="text-slate-400">Contact</p>
              <p className="font-semibold text-slate-700">{application.student?.phone}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Aspiration & Statement</p>
            <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 italic leading-relaxed">
              "{application.personalStatement}"
            </p>
          </div>
        </div>

        {/* Right Column: Volunteer Verification Findings */}
        <div className="space-y-4 bg-amber-50/40 p-4 rounded-xl border border-amber-200">
          <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Volunteer Field Report</h3>
          {application.verification ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="font-semibold text-slate-700">Living Condition Score:</span>
                <span className="font-black text-sm px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  {application.verification.livingStandardScore} / 10
                </span>
              </div>
              <p className="text-slate-600"><strong>Dwelling Observed:</strong> {application.verification.houseCondition}</p>
              <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-amber-200 leading-relaxed">
                <strong>Volunteer Notes:</strong> "{application.verification.remarks}"
              </p>
              <GeotagMap lat={application.verification.geoLatitude} lng={application.verification.geoLongitude} />
            </div>
          ) : (
            <div className="text-center py-8 text-amber-700 text-xs">
              Field inspection has not been submitted by the assigned volunteer yet.
            </div>
          )}
        </div>
      </div>

      {/* Decision Authorization Panel */}
      <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Grant Sanction Amount (₹)</label>
          <input
            type="number"
            value={sanctionAmt}
            onChange={(e) => setSanctionAmt(Number(e.target.value))}
            className="text-slate-900 font-bold px-3 py-2 rounded-lg text-sm w-48 outline-none"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSanctionDecision(application.id, sanctionAmt, 'REJECT')}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-xs font-bold rounded-lg transition"
          >
            Reject Application
          </button>
          <button
            onClick={() => onSanctionDecision(application.id, sanctionAmt, 'APPROVE')}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-xs font-bold rounded-lg transition"
          >
            Authorize Sanction Grant
          </button>
        </div>
      </div>
    </div>
  );
}