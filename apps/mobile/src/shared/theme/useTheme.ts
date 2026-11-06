import { useColorScheme } from "react-native";
import { darkColors, lightColors, type Colors } from "./tokens";

// Returns the colour set for the user's current appearance (light or dark). Re-renders when they change it.
export function useTheme(): Colors {
  return useColorScheme() === "dark" ? darkColors : lightColors;
}
