// Horizontal stacked bar showing pipeline distribution.
// No external chart library — pure SVG sized via parent.
import type { ContactStage } from "@/lib/contacts/types";
import { STAGE_COLOR, STAGE_LABEL } from "@/lib/contacts/types";

interface Segment {
  stage: ContactStage;
  count: number;
}

export function PipelineBars({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, x) => s + x.count, 0) || 1;
  return (
    <div className="space-y-2.5">
      {segments.map((s) => {
        const pct = (s.count / total) * 100;
        return (
          <div key={s.stage}>
            <div className="mb-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
              <span style={{ color: STAGE_COLOR[s.stage] }}>{STAGE_LABEL[s.stage]}</span>
              <span className="text-[var(--color-text-tertiary)]">
                {s.count} · {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-deep)]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: STAGE_COLOR[s.stage] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
