// Supabase email OTP length is configurable from 6 to 10 digits.
// Keep browser input limits and server validation in sync.
export const OTP_MIN_LENGTH = 6;
export const OTP_MAX_LENGTH = 10;
export const OTP_PATTERN = `[0-9]{${OTP_MIN_LENGTH},${OTP_MAX_LENGTH}}`;
export const OTP_REGEX = new RegExp(`^${OTP_PATTERN}(?![\\s\\S])`);

export function normaliseVerificationCode(value: string) {
  return value.replace(/\D/g, "").slice(0, OTP_MAX_LENGTH);
}
