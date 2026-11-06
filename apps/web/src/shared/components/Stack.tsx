import type { ComponentProps } from "react";
import { cx } from "@/shared/lib/cx";
import styles from "./Stack.module.css";

const GAP = {
  1: styles.gap1,
  2: styles.gap2,
  3: styles.gap3,
  4: styles.gap4,
  6: styles.gap6,
  8: styles.gap8,
} as const;

const ALIGN = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
} as const;

const JUSTIFY = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
} as const;

type StackProps = ComponentProps<"div"> & {
  gap?: keyof typeof GAP; // a step on the spacing scale, not a raw pixel number
  align?: keyof typeof ALIGN; // cross axis   (Flutter: crossAxisAlignment)
  justify?: keyof typeof JUSTIFY; // main axis (Flutter: mainAxisAlignment)
  wrap?: boolean; // let items drop to the next line when there is no room (Flutter: Wrap)
};

function Stack({
  direction,
  gap = 3,
  align,
  justify,
  wrap = false,
  className,
  ...rest
}: StackProps & { direction: "row" | "column" }) {
  return (
    <div
      className={cx(
        styles.stack,
        styles[direction],
        GAP[gap],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        wrap && styles.wrap,
        className,
      )}
      {...rest}
    />
  );
}

// Flutter's Row and Column, as tiny components.
export function Row(props: StackProps) {
  return (
    <Stack
      direction="row"
      {...props}
    />
  );
}

export function Column(props: StackProps) {
  return (
    <Stack
      direction="column"
      {...props}
    />
  );
}
