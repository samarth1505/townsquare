import { useRef } from "react";
import FancyInput, { type FancyInputHandle } from "./FancyInput";

export default function RefDemo() {
  const inputRef = useRef<FancyInputHandle>(null); // starts as null; filled in after the child mounts

  return (
    <div className="flex flex-wrap items-end gap-3">
      <FancyInput
        ref={inputRef}
        label="Child-owned input"
        name="fancy"
      />
      <button
        type="button"
        className="rounded-lg border border-app-control-border px-3 py-1.5"
        onClick={() => inputRef.current?.focus()}
      >
        Focus it from the parent
      </button>
      <button
        type="button"
        className="rounded-lg border border-app-control-border px-3 py-1.5"
        onClick={() => inputRef.current?.flag()}
      >
        Flag it as invalid
      </button>
    </div>
  );
}
