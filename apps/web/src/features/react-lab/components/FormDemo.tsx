import { useId, type ComponentProps } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// The SCHEMA is the single source of truth: it validates AND defines the TypeScript type of the form.
// (The same schema can validate on the server too, so the rules cannot drift apart.)
const schema = z
  .object({
    name: z.string().min(2, "Use at least 2 characters."),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string(),
  })
  // A rule that involves TWO fields: attach the error to the field the user should fix.
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "The passwords do not match.",
  });

type FormValues = z.infer<typeof schema>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type TextFieldProps = ComponentProps<"input"> & { label: string; error?: string };

// One reusable field: label, input and error wired together for screen readers (aria-invalid + aria-describedby).
function TextField({ label, error, ...inputProps }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
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
        aria-invalid={error !== undefined}
        aria-describedby={error ? errorId : undefined}
        className="rounded-lg border border-app-control-border bg-app-surface px-2 py-1"
        {...inputProps}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="m-0 text-sm text-app-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function FormDemo() {
  const {
    register, // connects an input to the form
    handleSubmit, // validates first; calls YOUR function only if everything is valid
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched", // validate when a field is left, then on every change (not while the user is still typing)
  });

  async function onSubmit() {
    await sleep(700); // pretend to call the server
    reset();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate // we show OUR messages instead of the browser's pop-ups
      className="grid max-w-sm gap-3"
    >
      {/* register("name") returns { name, onChange, onBlur, ref }: the inputs are UNCONTROLLED (the browser holds the
          value, React Hook Form reads it through the ref), so typing does not re-render the whole form. */}
      <TextField
        label="Name"
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        label="Password"
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />
      <TextField
        label="Confirm password"
        type="password"
        error={errors.confirm?.message}
        {...register("confirm")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg border border-app-control-border px-3 py-1.5 disabled:opacity-60"
      >
        {isSubmitting ? "Creating…" : "Create account"}
      </button>
      {isSubmitSuccessful && (
        <p
          role="status"
          className="m-0 text-sm"
        >
          Account created (demo).
        </p>
      )}
    </form>
  );
}
