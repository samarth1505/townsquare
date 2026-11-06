import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/app/App";
import {
  errorReporter,
  installGlobalErrorHandlers,
  installPageHideFlush,
} from "@/shared/lib/monitoring";
import { reportMetric } from "@/shared/lib/reportMetric";
import { initWebVitals } from "@/shared/lib/webVitals";

installGlobalErrorHandlers((error, context) => errorReporter.captureError(error, context));
initWebVitals(reportMetric);
installPageHideFlush(); // registered AFTER web-vitals, so its listener runs after the vitals were queued

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
