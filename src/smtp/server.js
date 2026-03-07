import { SMTPServer } from "smtp-server";
import { normalizeAddress } from "../utils/normalize.js";
import fs from "fs";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { randomUUID } from "crypto";
import { config } from "../config/index.js";
import { publishEmail } from "./rabbitmq.js";

const TMP_DIR = "/tmp/emails";

await fs.promises.mkdir(TMP_DIR, { recursive: true });

const allowSet = new Set(config.allowedDomains);
const allowAll = config.allowedDomains.length === 0;

export async function createSMTPServer() {
  const server = new SMTPServer({
    logger: false,

    disabledCommands: ["AUTH", "STARTTLS"],

    size: 1 * 1024 * 1024, // max 1MB email

    maxClients: 500,

    socketTimeout: 60000,

    // RCPT handler
    onRcptTo(address, session, cb) {
      try {
        const rawAddr = String(address.address || "").toLowerCase();
        const domain = rawAddr.split("@").pop();

        if (!allowAll && !allowSet.has(domain)) {
          return cb(new Error("550 Domain not allowed"));
        }

        if (!session.originalRcptTos) session.originalRcptTos = [];

        // chống spam nhiều recipients
        if (session.originalRcptTos.length >= 20) {
          return cb(new Error("452 Too many recipients"));
        }

        session.originalRcptTos.push(rawAddr);

        address.address = normalizeAddress(rawAddr);

        return cb();
      } catch (err) {
        console.log("🚀 ~ createSMTPServer ~ err:", err);
        return cb(err);
      }
    },

    // DATA handler
    async onData(stream, session, cb) {
      const messageId = randomUUID();
      const filePath = `${TMP_DIR}/${messageId}.eml`;

      try {
        const writeStream = createWriteStream(filePath);

        // stream email ra file
        await pipeline(stream, writeStream);


        // publish metadata vào RabbitMQ
        await publishEmail({
          messageId,
          filePath,
          envelope: {
            mailFrom: session.envelope.mailFrom?.address || null,
            rcptTo: session.envelope.rcptTo.map((r) => r.address),
            originalRcptTos: session.originalRcptTos || [],
          },
        });

        console.log(`[SMTP] Email ${messageId} saved (${filePath}) → RabbitMQ`);

        cb();
      } catch (err) {
        console.error("[SMTP] Error processing email:", err);
        cb(err);
      }
    },
  });

  await new Promise((resolve, reject) => {
    server.listen(config.smtp.port, config.smtp.host, (err) =>
      err ? reject(err) : resolve(),
    );
  });

  console.log(`SMTP server running on ${config.smtp.host}:${config.smtp.port}`);

  return server;
}
