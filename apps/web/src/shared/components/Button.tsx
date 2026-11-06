import type { ComponentProps } from "react";
import { cx } from "@/shared/lib/cx";
import styles from "./Button.module.css";

// ComponentProps<"button"> = every prop a native <button> accepts (onClick, disabled, children...).
type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
};

// `type` defaults to "button" so a Button inside a form never submits it by accident;
// submit buttons must say type="submit" on purpose.
export default function Button({
  variant = "primary",
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], className)}
      {...rest}
    />
  );
}
