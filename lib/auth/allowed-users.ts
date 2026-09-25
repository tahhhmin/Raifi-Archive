const allowedEmails = [
  process.env.ALLOWED_EMAIL_1,
  process.env.ALLOWED_EMAIL_2,
  process.env.ALLOWED_EMAIL_3,
  process.env.ALLOWED_EMAIL_4,
].filter(Boolean);

export function isAllowedEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return allowedEmails.includes(email.toLowerCase());
}