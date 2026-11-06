import { useState } from "react";
import Modal from "./Modal";

export default function ModalDemo() {
  const [open, setOpen] = useState(false);
  const [bubbled, setBubbled] = useState(0);

  return (
    // This <div> is the React PARENT of the modal, although in the DOM the modal lives under <body>.
    <div
      className="rounded-lg border border-dashed border-app-border p-3"
      onClick={() => setBubbled((count) => count + 1)}
    >
      <button
        type="button"
        className="rounded-lg border border-app-control-border px-3 py-1.5"
        onClick={() => setOpen(true)}
      >
        Open modal
      </button>
      <p className="mt-2 mb-0 text-sm text-app-muted">
        Clicks that reached this parent (including ones from inside the portal):{" "}
        <strong data-testid="bubbled">{bubbled}</strong>
      </p>

      {open && (
        <Modal
          title="A portal modal"
          onClose={() => setOpen(false)}
        >
          <p className="text-sm">
            I am in the DOM under body, but still a child of the dashed box in React.
          </p>
        </Modal>
      )}
    </div>
  );
}
