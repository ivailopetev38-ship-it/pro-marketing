"use client";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useCounter } from "@/hooks/use-counter";

interface Props {
  target: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CounterRamp({ target, durationMs = 2200, prefix = "", suffix = "", className }: Props) {
  const { ref, visible } = useScrollReveal<HTMLSpanElement>();
  const value = useCounter(target, durationMs, visible);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("bg-BG")}
      {suffix}
    </span>
  );
}
