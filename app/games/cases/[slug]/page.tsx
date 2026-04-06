import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { caseCatalog, getCaseBySlug } from "@/app/lib/cases";
import { CaseOpeningMachine } from "@/components/games/case-opening-machine";

export function generateStaticParams() {
  return caseCatalog.map((caseItem) => ({
    slug: caseItem.slug,
  }));
}

export default async function CaseDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseItem = getCaseBySlug(slug);

  if (!caseItem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2a47_0%,_#111827_45%,_#0a1020_100%)] text-white">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-5">
          <Link
            href="/games/cases"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold">{caseItem.name}</h1>
        </div>

        <div className="text-center">
          <div
            className="mx-auto flex h-32 w-32 items-center justify-center rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
            style={{ backgroundImage: caseItem.badgeGradient }}
          >
            <Image
              src={caseItem.image}
              alt={caseItem.name}
              width={100}
              height={100}
              className="h-24 w-24 object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.18)]"
            />
          </div>

          <h2 className="mt-5 text-4xl font-extrabold">{caseItem.name}</h2>
          <p className="mt-3 text-xl text-white/75">Spin to reveal your prize</p>
        </div>

        <CaseOpeningMachine caseData={caseItem} />
      </div>
    </main>
  );
}
