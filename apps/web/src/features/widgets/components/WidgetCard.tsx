import { useId, type ReactNode } from "react";
import styles from "./Widgets.module.css";

type WidgetCardProps = {
  title: string;
  loading?: boolean;
  children: ReactNode;
};

const SKELETON_LINES = 3;

// Shared frame for right-rail widgets: a titled section with a built-in loading skeleton.
export default function WidgetCard({ title, loading = false, children }: WidgetCardProps) {
  const titleId = useId(); // unique id so the section is labelled by its own heading

  return (
    <section
      className={styles.card}
      aria-labelledby={titleId}
      aria-busy={loading}
    >
      <h2
        id={titleId}
        className={styles.title}
      >
        {title}
      </h2>
      {loading
        ? Array.from({ length: SKELETON_LINES }, (_, i) => (
            <div
              key={i}
              className={styles.skeletonLine}
            />
          ))
        : children}
    </section>
  );
}
