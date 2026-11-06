import type { Metadata } from "next";
import BrokenClock from "./BrokenClock";
import FixedClock from "./FixedClock";

export const metadata: Metadata = { title: "Hydration demo", robots: { index: false } };

export default function HydrationDemo() {
  return (
    <>
      <h1>Hydration demo</h1>
      <p className="muted">
        Both clocks are client components. The server renders them to HTML, then the browser
        hydrates them. Open the browser console (development mode) and compare.
      </p>
      <section className="card">
        <h2>Broken: renders the current time directly</h2>
        <BrokenClock />
      </section>
      <section
        className="card"
        style={{ marginTop: 12 }}
      >
        <h2>Fixed: shows the time only after mounting</h2>
        <FixedClock />
      </section>
    </>
  );
}
