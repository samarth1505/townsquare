import type { ComponentProps } from "react";
import { MAIN_CONTENT_ID } from "@/shared/lib/a11y";

// The page's <main> landmark. Two jobs beyond being a landmark:
//  1) it is the target of the "Skip to main content" link (keyboard users jump past the navigation), and
//  2) tabIndex={-1} lets us move focus here from code after a navigation. -1 means "focusable by script, but
//     not a stop when pressing Tab". Without that, focus would stay on the (now gone) link the user clicked.
// The ring is hidden on this element only: it is a container, not a control.
export default function Main({ className, ...rest }: ComponentProps<"main">) {
  return (
    <main
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      className={className ? `${className} focus:outline-none` : "focus:outline-none"}
      {...rest}
    />
  );
}
