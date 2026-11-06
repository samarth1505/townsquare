import { Suspense, startTransition, use, useState } from "react";

const QUOTES = [
  "Make it work, make it right, make it fast.",
  "Premature optimisation is the root of all evil.",
  "Simple is better than complex.",
  "Read the code you did not write.",
];
const LOAD_MS = 800;
let counter = 0;

// A promise that resolves with a quote after a delay (a stand-in for fetch).
function fetchQuote(): Promise<string> {
  const text = QUOTES[counter++ % QUOTES.length] ?? "";
  return new Promise((resolve) => setTimeout(() => resolve(text), LOAD_MS));
}

// `use(promise)` READS a promise during render. While it is pending, React SUSPENDS this component: the nearest
// <Suspense> shows its fallback. When it resolves, React renders the component again with the value. No useEffect, no
// loading state variable. (Unlike other hooks, `use` may be called inside if/else and loops. It can also read Context.)
//
// RULE: the promise must come from OUTSIDE the render (state, props, a cache). A promise created inside this
// component would be a NEW promise on every render, so React would suspend again and again, forever.
function Quote({ promise }: { promise: Promise<string> }) {
  const text = use(promise);
  return <blockquote className="m-0 border-l-4 border-app-border pl-3">{text}</blockquote>;
}

export default function UseHookDemo() {
  const [promise, setPromise] = useState(fetchQuote);

  return (
    <div>
      <Suspense
        fallback={
          <p
            aria-busy="true"
            className="m-0 text-app-muted"
          >
            Loading a quote…
          </p>
        }
      >
        <Quote promise={promise} />
      </Suspense>
      <button
        type="button"
        className="mt-3 rounded-lg border border-app-control-border px-3 py-1.5"
        // In a transition, React KEEPS the old quote on screen while the new one loads instead of falling back to
        // the placeholder. (A transition tells React: "this update may wait; do not hide what is already shown.")
        onClick={() => startTransition(() => setPromise(fetchQuote()))}
      >
        Load another quote
      </button>
    </div>
  );
}
