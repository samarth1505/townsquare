// Input rules for the login form, shared by every app. Pure functions, no platform code.
const PHONE_DIGITS = 10;
const OTP_DIGITS = 6;

// Keeps only digits, up to `max` of them (what a phone or code field should accept while typing/pasting).
export const digitsOnly = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

export const sanitizePhoneInput = (value: string) => digitsOnly(value, PHONE_DIGITS);
export const sanitizeOtpInput = (value: string) => digitsOnly(value, OTP_DIGITS);

export const isValidPhone = (value: string) => new RegExp(`^\\d{${PHONE_DIGITS}}$`).test(value);
export const isValidOtp = (value: string) => new RegExp(`^\\d{${OTP_DIGITS}}$`).test(value);
