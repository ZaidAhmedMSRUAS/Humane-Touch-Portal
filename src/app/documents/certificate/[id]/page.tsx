import CertificateModal from "@/components/documents/CertificateModal";
import AwardLetterTemplate from "@/components/documents/AwardLetterModal";

export default function AdminDocumentView({ application }: { application: any }) {
  const certificateData = {
    certificateId: `HT-${application.id}`,
    studentName: application.student.name,
    usn: application.student.usn,
    collegeName: application.student.college,
    course: application.student.course,
    academicYear: application.academicYear || "2026-2027",
    scholarshipScheme: application.schemeName || "Higher Education Scholarship",
    awardedDate: new Date(application.approvedAt || Date.now()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    managingTrusteeName: "Dr. Trustee Name",
  };

  const awardLetterData = {
    referenceNumber: `HT/AW/${application.academicYear?.replace("-", "")}/${application.id}`,
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    studentName: application.student.name,
    usn: application.student.usn,
    course: application.student.course,
    collegeName: application.student.college,
    academicYear: application.academicYear || "2026-2027",
    sanctionedAmount: application.amountSanctioned || 25000,
    paymentMode: "Direct College Fee Transfer",
    trusteeSignatoryName: "Managing Trustee",
  };

  return (
    <div className="space-y-12 py-6">
      <section>
        <h3 className="text-lg font-bold text-slate-900 px-6 print:hidden">Scholarship Certificate</h3>
        <CertificateModal data={certificateData} />
      </section>

      <section>
        <h3 className="text-lg font-bold text-slate-900 px-6 print:hidden">Sanction Award Letter</h3>
        <AwardLetterTemplate data={awardLetterData} />
      </section>
    </div>
  );
}