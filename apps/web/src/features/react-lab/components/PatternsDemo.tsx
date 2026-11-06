import { useEffect, useState, type ComponentType, type ReactNode } from "react";

type Pointer = { x: number; y: number };

// THE SHARED LOGIC: "where is the mouse?". Three generations of React answered "how do I reuse this?" differently.

// 3) A CUSTOM HOOK (today's answer): a function that uses other hooks and returns what the caller needs.
function usePointer(): Pointer {
  const [pointer, setPointer] = useState<Pointer>({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (event: PointerEvent) => setPointer({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", handle);
    return () => window.removeEventListener("pointermove", handle);
  }, []);
  return pointer;
}

// 2) A RENDER PROP: a component that owns the logic and calls a function you give it to decide what to draw.
function PointerTracker({ render }: { render: (pointer: Pointer) => ReactNode }) {
  const pointer = usePointer();
  return <>{render(pointer)}</>;
}

// 1) A HIGHER-ORDER COMPONENT (HOC): a function that takes a component and returns a NEW component with extra props.
//    Used by older libraries (Redux's connect, React Router's withRouter). Downsides: the extra prop appears "from
//    nowhere", wrapping layers pile up in DevTools, and two HOCs can accidentally use the same prop name.
function withPointer<P extends { pointer: Pointer }>(Component: ComponentType<P>) {
  // The returned component takes the original props MINUS `pointer`, because the HOC supplies it.
  function WithPointer(props: Omit<P, "pointer">) {
    const pointer = usePointer();
    const allProps = { ...props, pointer } as P;
    return <Component {...allProps} />;
  }
  WithPointer.displayName = `withPointer(${Component.displayName ?? Component.name})`; // readable in DevTools
  return WithPointer;
}

const Readout = ({ label, pointer }: { label: string; pointer: Pointer }) => (
  <li>
    {label}:{" "}
    <span data-testid={`pointer-${label}`}>
      {pointer.x}, {pointer.y}
    </span>
  </li>
);

const HocReadout = withPointer(Readout);

function HookReadout() {
  const pointer = usePointer();
  return (
    <Readout
      label="hook"
      pointer={pointer}
    />
  );
}

export default function PatternsDemo() {
  return (
    <div>
      <p className="mt-0 text-sm text-app-muted">
        Move the mouse. Three ways to share one piece of logic:
      </p>
      <ul className="m-0 list-none p-0 text-sm">
        <HookReadout />
        <PointerTracker
          render={(pointer) => (
            <Readout
              label="render-prop"
              pointer={pointer}
            />
          )}
        />
        <HocReadout label="hoc" />
      </ul>
    </div>
  );
}
