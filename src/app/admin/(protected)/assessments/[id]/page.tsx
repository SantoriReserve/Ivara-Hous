import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatDate } from "@/lib/admin/admin-format";
import { getAdminAssessmentById } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import { ROUTES } from "@/lib/constants";

type AssessmentDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminAssessmentDetailPage({
  params,
  searchParams,
}: AssessmentDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const includeTestData = parseIncludeTestData(query.includeTestData);
  const assessment = await getAdminAssessmentById(id, { includeTestData });

  if (!assessment) {
    notFound();
  }

  const answers = assessment.answers;
  const preview = assessment.analysis?.preview;
  const scores = assessment.analysis?.scores;
  const scoreEntries = scores ? Object.entries(scores) : [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Assessment Detail"
        title={answers?.fullName || answers?.email || "Assessment"}
        description={`${answers?.email || "—"} · ${formatDate(assessment.submittedAt)}`}
        actions={
          <Link
            href={ROUTES.adminAssessments}
            className="font-sans text-xs uppercase tracking-nav text-gray-mid hover:text-black"
          >
            Back to Assessments
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-black/10 p-4">
          <p className="luxury-label mb-2 text-gray-muted">Creator Stage</p>
          <p className="font-sans text-sm">{preview?.currentCreatorStage || "—"}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="luxury-label mb-2 text-gray-muted">Archetype</p>
          <p className="font-sans text-sm">{preview?.creatorArchetype || "—"}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="luxury-label mb-2 text-gray-muted">Goals</p>
          <p className="font-sans text-sm">{answers?.goals || "—"}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="luxury-label mb-2 text-gray-muted">Challenge</p>
          <p className="font-sans text-sm">{answers?.biggestChallenge || "—"}</p>
        </div>
      </div>

      {scoreEntries.length ? (
        <div className="grid gap-3 sm:grid-cols-5">
          {scoreEntries.map(([key, score]) => (
            <div key={key} className="border border-black/10 p-3">
              <p className="font-sans text-xs uppercase tracking-nav text-gray-muted">{key}</p>
              <p className="mt-1 font-serif text-xl">{score}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-sans text-sm text-gray-mid">No score breakdown available for this assessment.</p>
      )}

      <section className="border border-black/10 p-6">
        <h3 className="mb-4 font-serif text-xl text-black">Full Assessment Answers</h3>
        <pre className="overflow-x-auto whitespace-pre-wrap font-sans text-xs text-gray-mid">
          {JSON.stringify(answers ?? {}, null, 2)}
        </pre>
      </section>
    </div>
  );
}
