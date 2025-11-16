// src/smtp/server.js
import { SMTPServer } from "smtp-server";
import { normalizeAddress } from "../utils/normalize.js";
import fs from "fs";
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
    size: 1 * 1024 * 1024, // 1mb max
    maxClients: 200,
    onRcptTo(address, session, cb) {
      const rawAddr = String(address.address || "").toLowerCase();
      const domain = rawAddr.split("@").pop();

      if (!allowAll && !allowSet.has(domain)) {
        return cb(new Error("550 Domain not allowed"));
      }

      if (!session.originalRcptTos) session.originalRcptTos = [];
      session.originalRcptTos.push(rawAddr);
      address.address = normalizeAddress(rawAddr);
      return cb();
    },

    onData(stream, session, cb) {
      const chunks = [];
      let size = 0;
      const maxSize = 50 * 1024 * 1024;

      stream.on("data", (chunk) => {
        size += chunk.length;
        if (size > maxSize) {
          return cb(new Error("552 Too large"));
        }
        chunks.push(chunk);
      });

      stream.on("end", async () => {
        try {
          const raw = Buffer.concat(chunks);
          const messageId = randomUUID();

          await publishEmail({
            messageId,
            raw: raw.toString("base64"), // Gửi nội dung
            envelope: {
              mailFrom: session.envelope.mailFrom?.address,
              rcptTo: session.envelope.rcptTo.map((r) => r.address),
              originalRcptTos: session.originalRcptTos || [],
            },
          });

          console.log(
            `[SMTP] Nhận email ${messageId} (${raw.length} bytes) → RabbitMQ`
          );
          cb();
        } catch (err) {
          console.error("[SMTP] Lỗi đẩy RabbitMQ:", err);
          cb(err);
        }
      });

      stream.on("error", cb);
    },
  });

  await new Promise((resolve, reject) => {
    server.listen(config.smtp.port, config.smtp.host, (err) =>
      err ? reject(err) : resolve()
    );
  });

  console.log(`SMTP server running on ${config.smtp.host}:${config.smtp.port}`);
  return server;
}
