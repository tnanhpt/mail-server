// src/worker/index.js
import { simpleParser } from "mailparser";
import fs from "fs/promises";
import { connectRabbitMQ, connectRabbitMQWithRetry, consumeEmails } from "../smtp/rabbitmq.js";
import { connectDB, Email } from "../db/mongo.js";
import { config } from "../config/index.js";
import { getVietnamTime } from "../smtp/rabbitmq.js";

async function processEmail({ fileId, raw, envelope }) {
  // const raw = await fs.readFile(filePath);
  const emailBuffer = Buffer.from(raw, "base64");
  const parsed = await simpleParser(emailBuffer);

  const now = new Date();
  const doc = {
    message_id: parsed.messageId || "",
    subject: parsed.subject || "",
    from: parsed.from?.text || "",
    to: (parsed.to?.value || []).map((v) => v.address),
    original_to: envelope.originalRcptTos || [],
    cc: (parsed.cc?.value || []).map((v) => v.address.toLowerCase()),
    // headers: Object.fromEntries(parsed.headerLines?.map((h) => [h.key, h.line]) || []),
    text: parsed.text || null,
    html: parsed.html || null,
    // attachments: (parsed.attachments || []).map((a) => ({
    //   filename: a.filename,
    //   contentType: a.contentType,
    //   size: a.size,
    // })),
    received_at: now,
    expires_at: new Date(now.getTime() + config.ttlMinutes * 60 * 1000),
    // file_id: fileId,
    read: false,
    raw_size: emailBuffer.length,
    
  };

  await Email.create(doc);
}

async function start() {
  await connectDB();
  await connectRabbitMQWithRetry();
  await consumeEmails(processEmail);

}

start().catch(console.error);