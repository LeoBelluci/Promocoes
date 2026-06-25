import { existsSync } from "node:fs";

const DEFAULT_REMINDER_RECIPIENTS: string[] = [];

const WINDOWS_BROWSER_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];

function normalizePhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return `+${digits}`;
}

export function getReminderWhatsAppRecipients() {
  const configuredRecipients = process.env.WHATSAPP_REMINDER_RECIPIENTS?.split(",")
    .map((recipient) => normalizePhoneNumber(recipient))
    .filter(Boolean);

  return configuredRecipients?.length ? configuredRecipients : DEFAULT_REMINDER_RECIPIENTS;
}

export function getWhatsAppSessionPath() {
  return process.env.WHATSAPP_WEB_SESSION_PATH?.trim() || ".wwebjs_auth";
}

export function getWhatsAppAuthTimeoutMs() {
  const configuredTimeout = Number(process.env.WHATSAPP_AUTH_TIMEOUT_MS);

  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : 120_000;
}

export function getBrowserExecutablePath() {
  const configuredPath = process.env.WHATSAPP_BROWSER_EXECUTABLE_PATH?.trim();

  if (configuredPath) {
    return configuredPath;
  }

  if (process.platform !== "win32") {
    return undefined;
  }

  return WINDOWS_BROWSER_PATHS.find((path) => existsSync(path));
}

export function toWhatsAppChatId(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");

  if (!digits) {
    throw new Error("Telefone de WhatsApp invalido.");
  }

  return `${digits}@c.us`;
}
