import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./AppText";
import { MIN_TOUCH_TARGET, radius, space } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";

type Option<T extends string> = { value: T; label: string };

// React Native has no <select>. A "pick one of a few" control is a row of buttons that act as a radio group, and the
// roles tell a screen reader "radio, selected, 2 of 3".
export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  hideLabel = false,
}: {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  hideLabel?: boolean; // keep the label for screen readers but do not draw it (the surrounding screen explains the control)
}) {
  const colors = useTheme();
  return (
    <View
      style={styles.wrapper}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
    >
      {hideLabel ? null : <AppText variant="label">{label}</AppText>}
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={[
                styles.segment,
                {
                  borderColor: colors.controlBorder,
                  backgroundColor: selected ? colors.primary : "transparent",
                },
                disabled && styles.disabled,
              ]}
            >
              <AppText
                variant="label"
                style={{ color: selected ? colors.primaryText : colors.text }}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: space.sm },
  row: { flexDirection: "row", gap: space.sm }, // flexDirection "row": the default in React Native is "column"
  segment: {
    flex: 1, // each segment takes an equal share of the row
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderRadius: radius,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.5 },
});
