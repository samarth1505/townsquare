import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { MIN_TOUCH_TARGET, radius, space } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";
import AppText from "./AppText";

type TextFieldProps = TextInputProps & { label: string; error?: string; hideLabel?: boolean };

// A labelled input. React Native has no <label for>: the label is wired for screen readers with
// accessibilityLabel, and an error is exposed through accessibilityHint plus a live region.
export default function TextField({
  label,
  error,
  hideLabel = false,
  style,
  ...inputProps
}: TextFieldProps) {
  const colors = useTheme();
  return (
    <View style={styles.wrapper}>
      {hideLabel ? null : <AppText variant="label">{label}</AppText>}
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: error ? colors.danger : colors.controlBorder,
          },
          style,
        ]}
        {...inputProps}
      />
      {error ? (
        <AppText
          variant="error"
          accessibilityLiveRegion="polite"
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: space.sm }, // `gap` works in React Native flexbox, just like in CSS
  input: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: space.md,
    borderWidth: 1,
    borderRadius: radius,
    fontSize: 16,
  },
});
