import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import qrcodeTerminal from "qrcode-terminal";
import WhatsAppWeb from "whatsapp-web.js";

const { Client, LocalAuth } = WhatsAppWeb;

const WINDOWS_BROWSER_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];

function loadEnvFile(fileName: string) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function getWhatsAppSessionPath() {
  return process.env.WHATSAPP_WEB_SESSION_PATH?.trim() || ".wwebjs_auth";
}

function getBrowserExecutablePath() {
  const configuredPath = process.env.WHATSAPP_BROWSER_EXECUTABLE_PATH?.trim();

  if (configuredPath) {
    return configuredPath;
  }

  if (process.platform !== "win32") {
    return undefined;
  }

  return WINDOWS_BROWSER_PATHS.find((path) => existsSync(path));
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: getWhatsAppSessionPath()
  }),
  puppeteer: {
    executablePath: getBrowserExecutablePath(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

client.on("qr", (qr) => {
  console.log("Escaneie este QR Code com o WhatsApp do celular:");
  qrcodeTerminal.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("WhatsApp Web autenticado.");
});

client.on("ready", async () => {
  console.log("Sessao WhatsApp Web pronta. O app ja pode enviar mensagens automaticas.");
  await client.destroy();
  process.exit(0);
});

client.on("auth_failure", (message) => {
  console.error(`Falha de autenticacao no WhatsApp Web: ${message}`);
  process.exit(1);
});

client.on("disconnected", (reason) => {
  console.error(`WhatsApp Web desconectado: ${reason}`);
  process.exit(1);
});

await client.initialize();
