import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCounter } from "./use-counter";

describe("useCounter", () => {
  it("counts up to target when started", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCounter(100, 1000, true));
    expect(result.current).toBe(0);
    act(() => { vi.advanceTimersByTime(1100); });
    expect(result.current).toBe(100);
    vi.useRealTimers();
  });

  it("does not start when active=false", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCounter(50, 500, false));
    act(() => { vi.advanceTimersByTime(600); });
    expect(result.current).toBe(0);
    vi.useRealTimers();
  });
});
