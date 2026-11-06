// The PUSH channel behind an adapter, the same idea as the OTP sender: the route code asks for "send a push" and does
// not know who delivers it. In production this would call Expo's push service (or APNs / FCM directly) with the device
// tokens; here it only records what WOULD have been sent, so the demo needs no accounts or keys.
export interface PushMessage {
  title: string;
  body: string;
  // Where the app should go when the user taps it. The app validates it against its own list of routes.
  data: { url: string };
}

export interface SentPush {
  tokens: string[];
  message: PushMessage;
  at: string;
}

export const sentPushes: SentPush[] = [];

export function sendPush(tokens: string[], message: PushMessage): void {
  if (tokens.length === 0) return;
  sentPushes.push({ tokens, message, at: new Date().toISOString() });
  console.log(`[push:mock] ${tokens.length} device(s): ${message.title}`);
}
