import type { ChangeEvent } from "react";
import { Column } from "@/shared/components";
import styles from "./Feed.module.css";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void; // gives the STRING, so the parent never deals with DOM events
  label: string;
};

// A controlled input: the parent owns the text, this component only displays it and reports changes.
export default function SearchBox({ value, onChange, label }: SearchBoxProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.currentTarget.value);
  }

  return (
    <Column gap={2}>
      <label
        className={styles.searchLabel}
        htmlFor="feed-search"
      >
        {label}
      </label>
      <input
        className={styles.searchInput}
        id="feed-search"
        type="search"
        value={value}
        onChange={handleChange}
      />
    </Column>
  );
}
