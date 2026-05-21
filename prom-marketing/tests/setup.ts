import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// `server-only` blows up in non-RSC test environments. Treat it as a no-op.
vi.mock("server-only", () => ({}));
