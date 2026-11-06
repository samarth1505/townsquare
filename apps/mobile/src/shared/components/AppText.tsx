import { StyleSheet, Text, type TextProps } from "react-native";
import { useTheme } from "../theme/useTheme";

type Variant = "title" | "body" | "muted" | "label" | "error";

// Every piece of text in React Native MUST be inside a <Text> (there is no "text node in a div" like on the web).
// Colour and size are NOT inherited from a parent View (only from a parent <Text>), so a small wrapper applies the
// theme everywhere instead of repeating colours in every screen.
export default function AppText({
  variant = "body",
  style,
  ...rest
}: TextProps & { variant?: Variant }) {
  const colors = useTheme();
  const color =
    variant === "muted" ? colors.textMuted : variant === "error" ? colors.danger : colors.text;
  return (
    <Text
      accessibilityRole={variant === "title" ? "header" : undefined}
      style={[styles[variant], { color }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "700" },
  body: { fontSize: 16 },
  muted: { fontSize: 14 },
  label: { fontSize: 14, fontWeight: "600" },
  error: { fontSize: 14 },
});
