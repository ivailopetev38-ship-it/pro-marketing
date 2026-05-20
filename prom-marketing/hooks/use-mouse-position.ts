"use client";
import { useEffect, useRef, useState } from "react";

export interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(target?: React.RefObject<HTMLElement | null>): MousePosition {
  const [pos, setPos] = useState<MousePosition>({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const el = target?.current ?? window;
    const handler = (e: MouseEvent) => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        if (target?.current) {
          const rect = target.current.getBoundingClientRect();
          setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        } else {
          setPos({ x: e.clientX, y: e.clientY });
        }
      });
    };
    el.addEventListener("mousemove", handler as EventListener);
    return () => {
      el.removeEventListener("mousemove", handler as EventListener);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [target]);

  return pos;
}
