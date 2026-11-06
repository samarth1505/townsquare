// Design tokens for the phone app: the SAME colours as the web app's tokens.css, so the two apps look related.
// On the web these are CSS variables switched by a media query; in React Native there is no CSS, so they are plain
// objects and a hook picks the right one for the user's light/dark setting.
export const lightColors = {
  bg: "#f4f6f9",
  surface: "#ffffff",
  text: "#1b1f24",
  textMuted: "#5b6573",
  border: "#d5dbe3",
  controlBorder: "#737d8c",
  primary: "#3b5bdb",
  primaryText: "#ffffff",
  danger: "#c92a2a",
};

export const darkColors: typeof lightColors = {
  bg: "#12151a",
  surface: "#1c2027",
  text: "#e8ebf0",
  textMuted: "#9aa5b4",
  border: "#343b47",
  controlBorder: "#79859a",
  primary: "#748ffc",
  primaryText: "#0f1320",
  danger: "#ff8787",
};

export type Colors = typeof lightColors;

// Spacing scale. In React Native sizes have NO units: they are "density-independent pixels" (dp), so 16 is about the
// same physical size on every phone.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = 8;
// Apple and Google both recommend touch targets of at least ~44-48 dp, so buttons and inputs are at least this tall.
export const MIN_TOUCH_TARGET = 48;
