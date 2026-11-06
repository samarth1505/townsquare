import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";

// 1) useLayoutEffect: measure the DOM and fix the layout BEFORE the browser paints.
//    The tooltip must sit above the button, but only the browser knows how tall the tooltip is. We render it once,
//    measure it, then move it. With useEffect the browser could paint the first (wrongly placed) frame, and the user
//    would see the tooltip jump. useLayoutEffect runs after the DOM changed but BEFORE the paint, so they never do.
function MeasuredTooltip() {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const tipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open && tipRef.current) setHeight(tipRef.current.getBoundingClientRect().height);
  }, [open]);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-describedby={open ? "lab-tip" : undefined}
        className="rounded-lg border border-app-control-border px-3 py-1.5"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide tip" : "Show tip"}
      </button>
      {open && (
        <div
          ref={tipRef}
          id="lab-tip"
          role="tooltip"
          data-height={height}
          style={{ top: -height - 8 }}
          className="absolute left-0 w-56 rounded-lg border border-app-border bg-app-bg p-2 text-sm"
        >
          Measured with useLayoutEffect, so it is placed before the first paint. This text wraps
          onto several lines.
        </div>
      )}
    </div>
  );
}

// 2) useEffectEvent: read the LATEST values inside an effect WITHOUT making the effect re-run.
//    The interval should be created once. But each tick must use the CURRENT `step`. Without useEffectEvent you
//    choose between two bad options: put `step` in the dependency list (the timer restarts on every change) or
//    leave it out (a stale closure: the tick keeps using the first value of `step` forever).
function Ticker() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const onTick = useEffectEvent(() => {
    setCount((current) => current + step); // always sees the latest `step`
  });

  useEffect(() => {
    const id = setInterval(() => onTick(), 1000);
    return () => clearInterval(id);
  }, []); // an Effect Event is NOT listed as a dependency: it is not "reactive"

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span>
        Count: <strong data-testid="ticker-count">{count}</strong>
      </span>
      <label className="text-sm">
        Step{" "}
        <select
          value={step}
          onChange={(e) => setStep(Number(e.currentTarget.value))}
          className="rounded border border-app-control-border bg-app-surface px-1"
        >
          <option value={1}>1</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </label>
    </div>
  );
}

export default function EffectsDemo() {
  return (
    <div className="space-y-6">
      <MeasuredTooltip />
      <Ticker />
    </div>
  );
}
