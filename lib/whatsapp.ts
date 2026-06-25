import "server-only";

import qrcodeTerminal from "qrcode-terminal";
import WhatsAppWeb from "whatsapp-web.js";
import {
  getBrowserExecutablePath,
  getWhatsAppAuthTimeoutMs,
  getWhatsAppSessionPath
} from "@/lib/whatsappConfig";

const { Client, LocalAuth } = WhatsAppWeb;

type WhatsAppClient = InstanceType<typeof Client>;

export interface WhatsAppSendRequest {
  to: string;
  body: string;
}

export interface WhatsAppSendResult {
  provider: "whatsapp-web";
  providerMessageId: string;
  status: string;
  to: string;
}

interface WhatsAppClientState {
  client?: WhatsAppClient;
  ready: boolean;
  readyPromise?: Promise<WhatsAppClient>;
}

const globalWithWhatsApp = globalThis as typeof globalThis & {
  __promocoesWhatsAppClient?: WhatsAppClientState;
};

const clientState = (globalWithWhatsApp.__promocoesWhatsAppClient ??= {
  ready: false
});

function createClient() {
  const executablePath = getBrowserExecutablePath();
  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: getWhatsAppSessionPath()
    }),
    puppeteer: {
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
  });

  client.on("qr", (qr) => {
    console.info("Escaneie este QR Code no WhatsApp para autorizar o envio automatico:");
    qrcodeTerminal.generate(qr, { small: true });
  });

  client.on("authenticated", () => {
    console.info("WhatsApp Web autenticado.");
  });

  client.on("ready", () => {
    clientState.ready = true;
    console.info("WhatsApp Web pronto para enviar mensagens.");
  });

  client.on("auth_failure", (message) => {
    clientState.ready = false;
    console.error("Falha de autenticacao no WhatsApp Web", message);
  });

  client.on("disconnected", (reason) => {
    clientState.client = undefined;
    clientState.ready = false;
    clientState.readyPromise = undefined;
    console.warn("WhatsApp Web desconectado", reason);
  });

  void client.initialize().catch((error) => {
    clientState.client = undefined;
    clientState.ready = false;
    clientState.readyPromise = undefined;
    console.error("Nao foi possivel iniciar o WhatsApp Web", error);
  });

  return client;
}

function waitForReady(client: WhatsAppClient) {
  if (clientState.ready) {
    return Promise.resolve(client);
  }

  if (clientState.readyPromise) {
    return clientState.readyPromise;
  }

  clientState.readyPromise = new Promise<WhatsAppClient>((resolve, reject) => {
    const timeout = setTimeout(() => {
      clientState.readyPromise = undefined;
      reject(
        new Error(
          "WhatsApp Web ainda nao esta autenticado. Rode `corepack pnpm whatsapp:login` e escaneie o QR Code no terminal."
        )
      );
    }, getWhatsAppAuthTimeoutMs());

    const cleanup = () => {
      clearTimeout(timeout);
      client.off("ready", handleReady);
      client.off("auth_failure", handleAuthFailure);
      client.off("disconnected", handleDisconnected);
    };

    const handleReady = () => {
      cleanup();
      clientState.ready = true;
      resolve(client);
    };

    const handleAuthFailure = (message: string) => {
      cleanup();
      clientState.ready = false;
      clientState.readyPromise = undefined;
      reject(new Error(`Falha de autenticacao no WhatsApp Web: ${message}`));
    };

    const handleDisconnected = (reason: string) => {
      cleanup();
      clientState.ready = false;
      clientState.readyPromise = undefined;
      reject(new Error(`WhatsApp Web desconectado: ${reason}`));
    };

    client.once("ready", handleReady);
    client.once("auth_failure", handleAuthFailure);
    client.once("disconnected", handleDisconnected);
  });

  return clientState.readyPromise;
}

async function getReadyClient() {
  const client = clientState.client ?? createClient();
  clientState.client = client;

  return waitForReady(client);
}

export async function sendWhatsAppMessage({
  to,
  body
}: WhatsAppSendRequest): Promise<WhatsAppSendResult> {
  const client = await getReadyClient();
  const digits = to.replace(/\D/g, "");
  const numberId = digits ? await client.getNumberId(digits) : null;

  if (!numberId?._serialized) {
    throw new Error(`O telefone ${to} nao foi encontrado no WhatsApp.`);
  }

  const message = await client.sendMessage(numberId._serialized, body);

  return {
    provider: "whatsapp-web",
    providerMessageId: message.id._serialized,
    status: "sent",
    to
  };
}
