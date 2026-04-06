import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Package2, Sparkles } from "lucide-react";
import { caseCatalog } from "@/app/lib/cases";

export default function CasesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-6 text-white">
      <div className="mb-8 flex items-center gap-4 border-b border-white/20 pb-5">
        <Link
          href="/games"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold">Cases</h1>
      </div>

      <p className="mb-8 text-center text-lg text-white/90">
        Choose a case to open and win amazing prizes
      </p>

      <div className="space-y-4">
        {caseCatalog.map((caseItem) => (
          <Link
            key={caseItem.slug}
            href={`/games/cases/${caseItem.slug}`}
            className="flex items-center gap-4 rounded-3xl bg-white px-5 py-5 text-black shadow-sm transition active:scale-[0.99]"
          >
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundImage: caseItem.badgeGradient }}
            >
              <Image
                src={caseItem.image}
                alt={caseItem.name}
                width={64}
                height={64}
                className="h-14 w-14 object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.16)]"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-[1.85rem] font-extrabold leading-none">{caseItem.name}</h2>

              <div className="mt-3 flex items-center gap-2 text-lg text-slate-700">
                <Package2 className="h-4 w-4 text-slate-500" />
                <span>Open for {caseItem.priceTon} TON</span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-[0.95rem] text-slate-500">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>{caseItem.shortDescription}</span>
              </div>
            </div>

            <ChevronRight className="h-6 w-6 shrink-0 text-slate-400" />
          </Link>
        ))}
      </div>
    </main>
  );
}
