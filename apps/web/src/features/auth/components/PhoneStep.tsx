import { useState, type ChangeEvent, type FormEvent } from "react";
import type { OtpChannel } from "@hub/core";
import { Button } from "@/shared/components";
import styles from "./AuthForm.module.css";

const PHONE_RE = /^\d{10}$/;

type PhoneStepProps = {
  onSubmit: (phone: string, channel: OtpChannel) => void;
  locked?: boolean; // optional: true while the OTP step is showing, so the number can't change
  errorId?: string; // id of the error message about this form, if there is one
};

export default function PhoneStep({ onSubmit, locked = false, errorId }: PhoneStepProps) {
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<OtpChannel>("sms");

  const isValid = PHONE_RE.test(phone); // derived from state: computed every render, never stored

  function handlePhoneChange(e: ChangeEvent<HTMLInputElement>) {
    setPhone(e.currentTarget.value.replace(/\D/g, "").slice(0, 10)); // digits only, max 10
  }

  function handleChannelChange(e: ChangeEvent<HTMLSelectElement>) {
    setChannel(e.currentTarget.value as OtpChannel);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(phone, channel);
  }

  return (
    <form
      className={styles.card}
      onSubmit={handleSubmit}
    >
      <h1 className={styles.title}>Log in to Hub</h1>

      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor="phone"
        >
          Phone number
        </label>
        <input
          className={styles.input}
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          aria-invalid={errorId !== undefined}
          aria-describedby={errorId}
          value={phone}
          onChange={handlePhoneChange}
          disabled={locked}
        />
      </div>

      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor="channel"
        >
          Send code via
        </label>
        <select
          className={styles.input}
          id="channel"
          value={channel}
          onChange={handleChannelChange}
          disabled={locked}
        >
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="call">Call</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={!isValid || locked}
      >
        Send code
      </Button>
    </form>
  );
}
