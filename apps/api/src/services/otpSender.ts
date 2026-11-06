import { config } from "../config.js";

export type OtpChannel = "sms" | "whatsapp" | "call";

// Adapter interface: real providers (Twilio, MSG91, Gupshup...) would implement the same shape.
export interface OtpSender {
  send(phone: string, code: string): Promise<void>;
}

const mock = (label: string): OtpSender => ({
  async send(phone, code) {
    console.log(`[MOCK ${label}] to ${phone}: your Hub code is ${code}`);
  },
});

const senders: Record<OtpChannel, OtpSender> = {
  sms: mock("SMS"),
  whatsapp: mock("WHATSAPP"),
  call: mock("VOICE CALL"),
};

export const isChannel = (v: unknown): v is OtpChannel =>
  v === "sms" || v === "whatsapp" || v === "call";
export const sendOtp = (channel: OtpChannel, phone: string) =>
  senders[channel].send(phone, config.otpCode);
