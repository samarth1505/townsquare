import { StyleSheet, View } from "react-native";
import { radius, space } from "@/shared/theme/tokens";
import { useTheme } from "@/shared/theme/useTheme";
import { IMAGE_ASPECT_RATIO, SCREEN_PADDING, SKELETON_CARD_COUNT } from "../constants";

// Grey boxes in the shape of the real cards, shown on the very first load, so the screen does not jump when data arrives.
export default function FeedSkeleton() {
  const colors = useTheme();
  const block = { backgroundColor: colors.border };
  return (
    <View
      style={styles.wrapper}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <View
          key={index}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.image, block]} />
          <View style={styles.body}>
            <View style={[styles.line, block]} />
            <View style={[styles.line, styles.short, block]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: SCREEN_PADDING, gap: space.md },
  card: { borderWidth: 1, borderRadius: radius, overflow: "hidden" },
  image: { width: "100%", aspectRatio: IMAGE_ASPECT_RATIO },
  body: { padding: space.md, gap: space.sm },
  line: { height: 14, borderRadius: 4 },
  short: { width: "60%" },
});
