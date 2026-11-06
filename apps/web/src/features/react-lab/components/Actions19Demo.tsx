import { startTransition, useActionState, useOptimistic, useState } from "react";
import { useFormStatus } from "react-dom";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const SAVE_DELAY_MS = 900;

// ---------------------------------------------------------------------------------------------------------------
// 1) <form action={fn}> + useActionState + useFormStatus   (React 19 "Actions")
// ---------------------------------------------------------------------------------------------------------------
type SubscribeState =
  { status: "idle" } | { status: "error"; message: string } | { status: "success"; email: string };

// An ACTION: an async function React calls with the form's data. Its return value becomes the new state.
// (previousState, formData) -> newState. No event.preventDefault(), no manual loading flag, no manual reset.
async function subscribeAction(
  _previous: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) return { status: "error", message: "Enter a valid email address." };
  await sleep(SAVE_DELAY_MS); // pretend to call the server
  return { status: "success", email };
}

// useFormStatus reads the status of the PARENT <form>. It only works in a component rendered INSIDE the form,
// which is why the button is its own component.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-app-control-border px-3 py-1.5 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Subscribe"}
    </button>
  );
}

function SubscribeForm() {
  // [latest state, the function to put in <form action>, is an action running?]
  const [state, formAction, isPending] = useActionState(subscribeAction, {
    status: "idle",
  } as SubscribeState);

  return (
    <form
      action={formAction}
      noValidate // without this the BROWSER would block an invalid email before our action ever runs
      className="flex flex-wrap items-end gap-2"
    >
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          aria-invalid={state.status === "error"}
          className="rounded-lg border border-app-control-border bg-app-surface px-2 py-1"
        />
      </label>
      <SubmitButton />
      <p
        role="status"
        aria-busy={isPending}
        className="m-0 w-full text-sm"
        data-testid="subscribe-status"
      >
        {state.status === "error" && state.message}
        {state.status === "success" && `Subscribed ${state.email}.`}
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// 2) useOptimistic: show the result BEFORE the server confirms, and undo it automatically if the action fails
// ---------------------------------------------------------------------------------------------------------------
type Comment = { id: string; text: string; sending?: boolean };

function CommentBox() {
  const [comments, setComments] = useState<Comment[]>([{ id: "c1", text: "First comment" }]);
  const [failNext, setFailNext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // optimisticComments = the REAL comments, plus any pending optimistic ones. When the action finishes, React throws
  // the optimistic layer away and shows the real state again: success and failure are both handled by that one rule.
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (current: Comment[], pending: Comment) => [...current, pending],
  );

  async function addComment(formData: FormData) {
    const text = String(formData.get("text") ?? "").trim();
    if (!text) return;
    setError(null);
    addOptimistic({ id: `pending-${text}`, text, sending: true }); // appears immediately
    try {
      await sleep(SAVE_DELAY_MS);
      if (failNext) throw new Error("The server rejected the comment.");
      startTransition(() =>
        setComments((current) => [...current, { id: crypto.randomUUID(), text }]),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong."); // the optimistic row vanishes by itself
    }
  }

  return (
    <div>
      <ul
        className="m-0 mb-2 list-none p-0 text-sm"
        data-testid="comments"
      >
        {optimisticComments.map((comment) => (
          <li
            key={comment.id}
            className={comment.sending ? "opacity-60" : ""}
          >
            {comment.text}
            {comment.sending && " (sending…)"}
          </li>
        ))}
      </ul>
      <form
        action={addComment}
        className="flex flex-wrap items-center gap-2"
      >
        <input
          name="text"
          aria-label="Comment"
          className="rounded-lg border border-app-control-border bg-app-surface px-2 py-1"
        />
        <SubmitButtonLabel label="Add comment" />
        <label className="text-sm">
          <input
            type="checkbox"
            checked={failNext}
            onChange={(e) => setFailNext(e.currentTarget.checked)}
          />{" "}
          Make the server fail
        </label>
      </form>
      {error && (
        <p
          role="alert"
          className="mt-2 mb-0 text-sm text-app-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButtonLabel({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-app-control-border px-3 py-1.5 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export default function Actions19Demo() {
  return (
    <div className="space-y-6">
      <SubscribeForm />
      <CommentBox />
    </div>
  );
}
