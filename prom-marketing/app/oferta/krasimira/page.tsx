import { OfertaHero } from "@/components/oferta/OfertaHero";
import { BrandVision } from "@/components/oferta/BrandVision";
import { WhatWeBuild } from "@/components/oferta/WhatWeBuild";
import { ScopeBreakdown } from "@/components/oferta/ScopeBreakdown";
import { OfertaTimeline } from "@/components/oferta/OfertaTimeline";
import { WhyPartner } from "@/components/oferta/WhyPartner";
import { OfertaClosing } from "@/components/oferta/OfertaClosing";

export default function KrasimiraOfertaPage() {
  return (
    <main className="font-[family-name:var(--font-body)] text-[var(--color-text-primary)]">
      <OfertaHero />
      <BrandVision />
      <WhatWeBuild />
      <ScopeBreakdown />
      <OfertaTimeline />
      <WhyPartner />
      <OfertaClosing />
    </main>
  );
}
