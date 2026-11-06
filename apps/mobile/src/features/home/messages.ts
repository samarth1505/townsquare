export const HOME_MESSAGES = {
  title: "Welcome to Hub",
  signedInAs: (maskedPhone: string) => `Signed in as ${maskedPhone}`,
  explainer:
    "In this demo the access token lasts only 30 seconds. Wait more than 30 seconds, then tap the button: the request gets a 401, the app renews the token silently, and retries.",
  whoAmI: "Ask the server who I am",
  asking: "Asking…",
  serverSays: (maskedPhone: string) => `Server says: ${maskedPhone}`,
  refreshes: (count: number) => `Silent token renewals so far: ${count}`,
  logout: "Log out",
} as const;
