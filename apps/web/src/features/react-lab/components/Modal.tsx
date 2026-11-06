import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

// A modal rendered through a PORTAL.
//
// Problem: a modal should cover the whole page, but if it is rendered inside a component, ancestors with
// `overflow: hidden`, `transform` or a low `z-index` can clip or hide it.
// createPortal(children, document.body) renders the children into a DIFFERENT place in the DOM (directly under
// <body>) while keeping them in the same place in the REACT tree. So:
//   - layout: the modal escapes the clipping ancestors
//   - events: a click inside the modal still BUBBLES to React parents (React follows the component tree, not the DOM)
//   - context and state: still available, because it is still the same React tree
//
// The native <dialog> element does the hard accessibility work for free: showModal() traps focus inside, Escape
// closes it, the page behind becomes inert, and focus returns to the button that opened it.
export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal(); // "already open" can happen when StrictMode re-runs this effect
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // The browser fires `close` ASYNCHRONOUSLY. In development, StrictMode runs the effect's cleanup and setup again,
      // so a `close` event from the cleanup can arrive after the dialog was opened again: ignore it if it is open.
      onClose={() => {
        if (!dialogRef.current?.open) onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose(); // a click on the dimmed backdrop itself
      }}
      className="m-auto rounded-lg border border-app-border bg-app-surface p-0 text-app-text backdrop:bg-black/50"
    >
      <div className="w-80 max-w-[90vw] p-4">
        <h3
          id={titleId}
          className="m-0 text-lg font-semibold"
        >
          {title}
        </h3>
        {children}
        {/* method="dialog": submitting this form closes the dialog natively, and the browser puts focus back on the
            button that opened it. No JavaScript needed for the close itself. */}
        <form
          method="dialog"
          className="mt-3"
        >
          <button
            type="submit"
            className="rounded-lg border border-app-control-border px-3 py-1.5"
          >
            Close
          </button>
        </form>
      </div>
    </dialog>,
    document.body,
  );
}
