import { useState } from "react";
import { Button, Column } from "@/shared/components";

const WORK_MS = 300; // the same amount of CPU work in both versions
const SLICE_MS = 10; // chunked version: work for 10 ms, then let the browser breathe

// Burns CPU for `ms` milliseconds (stands in for a heavy calculation).
function busyWait(ms: number) {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // spin
  }
}

// Lets the browser handle clicks, typing and painting before we continue.
const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

// Measures the LONGEST gap between two 10 ms timer ticks = the longest time the main thread was frozen.
function startFreezeMeter() {
  let last = performance.now();
  let longest = 0;
  const id = setInterval(() => {
    const now = performance.now();
    longest = Math.max(longest, now - last);
    last = now;
  }, 10);
  return () => {
    clearInterval(id);
    return Math.round(longest);
  };
}

// Same work, two ways. INP measures how long the page takes to respond to a click, so a long frozen
// main thread = a bad (high) INP. Slicing the work keeps the page responsive.
export default function InpDemo() {
  const [result, setResult] = useState("Press a button.");

  async function run(label: string, work: () => Promise<void> | void) {
    const stop = startFreezeMeter();
    await yieldToMain();
    await work();
    await new Promise((resolve) => setTimeout(resolve, 60)); // let the meter record the end of the freeze
    setResult(`${label}: longest main-thread freeze = ${stop()} ms (INP target: under 200 ms)`);
  }

  const runBlocking = () => run("One long task", () => busyWait(WORK_MS));

  const runChunked = () =>
    run("Chunked into 10 ms slices", async () => {
      for (let done = 0; done < WORK_MS; done += SLICE_MS) {
        busyWait(SLICE_MS);
        await yieldToMain(); // yield between slices
      }
    });

  return (
    <section>
      <h2>INP demo</h2>
      <Column gap={2}>
        <div>
          <Button onClick={runBlocking}>Block the main thread (300 ms)</Button>{" "}
          <Button
            variant="secondary"
            onClick={runChunked}
          >
            Same work, in chunks
          </Button>
        </div>
        <p
          role="status"
          data-inp-result
        >
          {result}
        </p>
      </Column>
    </section>
  );
}
