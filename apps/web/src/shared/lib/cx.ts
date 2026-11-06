// Joins class names, skipping falsy ones: cx("a", isOn && "b", undefined) -> "a b"
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
