import type { Metric } from "web-vitals";
import { IS_DEV } from "./config";
import { analytics } from "./monitoring";

// Web Vitals are field measurements from real users: they go through the analytics pipeline (batched, and flushed
// when the page is hidden, which is when LCP/CLS/INP settle).
export function reportMetric(metric: Metric): void {
  analytics.track("web_vital", { metric: metric.name, value: metric.value, rating: metric.rating });
  if (IS_DEV) {
    const value = metric.name === "CLS" ? metric.value.toFixed(3) : `${Math.round(metric.value)}ms`;
    console.info(`[web-vital] ${metric.name} = ${value} (${metric.rating})`);
  }
}
