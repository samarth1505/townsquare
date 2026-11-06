import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type Ref,
} from "react";

// What the PARENT is allowed to do with this component: a small, deliberate API, not the whole DOM node.
export type FancyInputHandle = { focus: () => void; flag: () => void };

type FancyInputProps = Omit<ComponentProps<"input">, "ref"> & {
  label: string;
  // React 19: `ref` is an ordinary prop on function components. (Before 19 you had to wrap the component in
  // forwardRef; that is still seen in older code.)
  ref?: Ref<FancyInputHandle>;
};

export default function FancyInput({ label, ref, ...inputProps }: FancyInputProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [flagged, setFlagged] = useState(false);

  // useImperativeHandle decides what `ref.current` is for the parent. Without it the parent would get the raw <input>
  // (or nothing). Exposing `focus` and `flag` keeps the DOM node private: the parent cannot depend on its internals.
  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      flag: () => {
        setFlagged(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setFlagged(false), 1200);
      },
    }),
    [],
  );

  useEffect(() => () => clearTimeout(timerRef.current), []); // do not set state after unmounting

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm"
      >
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        aria-invalid={flagged}
        className={
          "rounded-lg border bg-app-surface px-2 py-1 " +
          (flagged ? "border-app-danger ring-2 ring-app-danger" : "border-app-control-border")
        }
        {...inputProps}
      />
    </div>
  );
}
