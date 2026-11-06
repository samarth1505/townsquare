import "@testing-library/jest-dom/vitest"; // adds matchers such as toBeInTheDocument()
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Tests must not send real network traffic: telemetry goes through navigator.sendBeacon, which jsdom lacks.
Object.defineProperty(navigator, "sendBeacon", { value: vi.fn(() => true), configurable: true });

// Unmount whatever a test rendered, so tests cannot leak into each other.
afterEach(() => cleanup());
