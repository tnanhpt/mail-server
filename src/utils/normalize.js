// src/utils/normalize.js
export function normalizeAddress(email) {
  if (!email) return "";
  const [local, domain] = email.toLowerCase().split("@");
  if (!domain) return email;
  const normalizedLocal = local.replace(/\./g, "").split("+")[0];
  return `${normalizedLocal}@${domain}`;
}