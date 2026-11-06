import { onCLS, onINP, onLCP, type Metric } from "web-vitals";

// Starts measuring the three Core Web Vitals on REAL page loads (field data, "RUM").
//   LCP: how fast the main content appears      CLS: how much the layout jumps      INP: how responsive taps/clicks feel
export function initWebVitals(report: (metric: Metric) => void): void {
  onLCP(report);
  onCLS(report);
  onINP(report);
}
