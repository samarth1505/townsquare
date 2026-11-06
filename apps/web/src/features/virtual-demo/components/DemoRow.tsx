import { memo } from "react";
import styles from "./VirtualDemo.module.css";

type DemoRowProps = {
  index: number;
};

// A stand-in for a feed card: a few DOM nodes per row, like a real card has.
function DemoRow({ index }: DemoRowProps) {
  return (
    <div
      className={styles.row}
      data-row
    >
      <p className={styles.rowTitle}>Post #{index + 1}</p>
      <p className={styles.rowText}>A short description for row number {index + 1}.</p>
    </div>
  );
}

export default memo(DemoRow);
