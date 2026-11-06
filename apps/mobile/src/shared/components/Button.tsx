import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from "react-native";
import { MIN_TOUCH_TARGET, radius, space } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";
import AppText from "./AppText";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: "primary" | "secondary";
  loading?: boolean;
};

// <Pressable> is React Native's low-level touch handler (the replacement for a web <button> and onClick).
// Its style can be a FUNCTION of the touch state, which is how "pressed" feedback is done: there is no :hover or
// :active in CSS here. Accessibility is explicit: the role, and the disabled/busy state, are announced by the screen
// readers (VoiceOver on iOS, TalkBack on Android).
export default function Button({
  label,
  variant = "primary",
  loading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const colors = useTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary
          ? { backgroundColor: colors.primary }
          : { backgroundColor: "transparent", borderColor: colors.controlBorder, borderWidth: 1 },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.primaryText : colors.text} />
      ) : (
        <AppText
          variant="label"
          style={{ color: isPrimary ? colors.primaryText : colors.text }}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: space.lg,
    borderRadius: radius,
    alignItems: "center", // a View's children are laid out in a COLUMN by default; alignItems is the cross axis (horizontal)
    justifyContent: "center",
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
