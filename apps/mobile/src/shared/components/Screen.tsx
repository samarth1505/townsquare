import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { space } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";

// The standard page container for every screen. It solves three phone-only problems:
//  1) SAFE AREAS: phones have a notch, a status bar and a home indicator that cover part of the screen. SafeAreaView
//     adds padding so content never sits underneath them.
//  2) KEYBOARD: the on-screen keyboard covers the lower half. KeyboardAvoidingView lifts the content above it. (iOS
//     needs "padding"; Android already resizes the window itself, so it needs nothing.)
//  3) SCROLLING: content that does not fit must scroll, and a tap outside an input must still reach buttons while
//     the keyboard is open (keyboardShouldPersistTaps="handled").
// `scroll={false}` is for screens whose body is itself a FlatList: a list must never sit inside a ScrollView, or it loses
// its windowing (it would render every row at once) and React Native warns about it.
export default function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const colors = useTheme();
  return (
    <SafeAreaView
      style={[styles.fill, { backgroundColor: colors.bg }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.fill}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 }, // flex: 1 means "take all the space your parent gives you" (a screen fills the screen)
  content: { padding: space.xl, gap: space.lg, flexGrow: 1 },
});
