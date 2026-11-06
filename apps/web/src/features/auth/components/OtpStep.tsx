import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { RESEND_COOLDOWN_SECONDS } from "../constants";
import { useCountdown } from "../hooks/useCountdown";
import { Button } from "@/shared/components";
import MaskedPhone from "./MaskedPhone";
import styles from "./AuthForm.module.css";

type OtpStepProps = {
  phone: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
  submitting?: boolean;
  errorId?: string; // id of the error message about this form, if there is one
};

const OTP_RE = /^\d{6}$/;

export default function OtpStep({
  phone,
  onVerify,
  onResend,
  onBack,
  submitting = false,
  errorId,
}: OtpStepProps) {
  const [otp, setOtp] = useState("");
  const isValid = OTP_RE.test(otp);

  const inputRef = useRef<HTMLInputElement>(null);
  const { secondsLeft, restart } = useCountdown(RESEND_COOLDOWN_SECONDS);

  // Runs once, right after this component first appears on screen: put the cursor in the box.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleOtpChange(e: ChangeEvent<HTMLInputElement>) {
    setOtp(e.currentTarget.value.replace(/\D/g, "").slice(0, 6));
  }

  function handleOtpVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the browser's full-page form submit
    if (!isValid) return;
    onVerify(otp);
  }

  function handleResend() {
    onResend();
    restart();
  }

  return (
    <form
      className={styles.card}
      onSubmit={handleOtpVerify}
    >
      <h1 className={styles.title}>
        Enter the code sent to <MaskedPhone phone={phone} />
      </h1>

      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor="otp"
        >
          Verification code
        </label>
        <input
          className={styles.input}
          ref={inputRef}
          id="otp"
          type="text"
          value={otp}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-invalid={errorId !== undefined}
          aria-describedby={errorId}
          onChange={handleOtpChange}
        />
      </div>

      <div className={styles.actions}>
        <Button
          type="submit"
          disabled={!isValid || submitting}
        >
          Verify
        </Button>
        <Button
          variant="secondary"
          disabled={secondsLeft > 0 || submitting}
          onClick={handleResend}
        >
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
        </Button>
        <Button
          variant="secondary"
          disabled={submitting}
          onClick={onBack}
        >
          Change number
        </Button>
      </div>
    </form>
  );
}
