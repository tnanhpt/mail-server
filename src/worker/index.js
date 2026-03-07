import { simpleParser } from "mailparser";
import fs from "fs/promises";
import os from "os";

import { consumeEmails, connectRabbitMQWithRetry } from "../smtp/rabbitmq.js";
import { connectDB, Email } from "../db/mongo.js";
import { config } from "../config/index.js";

const CPU_COUNT = os.cpus().length;

const WORKER_CONCURRENCY = CPU_COUNT * 2;
const BATCH_SIZE = 50;

let activeWorkers = 0;

const queue = [];
let batch = [];

async function parseEmail(job) {
  const { messageId, filePath, envelope } = job;

  const raw = await fs.readFile(filePath);

  const parsed = await simpleParser(raw);

  const now = new Date();

  const doc = {
    message_id: parsed.messageId || messageId,
    subject: parsed.subject || "",
    from: parsed.from?.text || "",

    to: (parsed.to?.value || []).map((v) =>
      v.address.toLowerCase()
    ),

    original_to: envelope.originalRcptTos || [],

    cc: (parsed.cc?.value || []).map((v) =>
      v.address.toLowerCase()
    ),

    text: parsed.text || null,

    html: parsed.html || null,

    received_at: now,

    expires_at: new Date(
      now.getTime() + config.ttlMinutes * 60 * 1000
    ),

    read: false,

    raw_size: raw.length,
  };

  await fs.unlink(filePath);

  return doc;
}

async function flushBatch() {
  if (batch.length === 0) return;

  const docs = batch;
  batch = [];

  try {
    await Email.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error("[WORKER] Mongo batch insert error:", err);
  }
}

async function workerLoop() {
  while (true) {
    const job = queue.shift();

    if (!job) {
      await new Promise((r) => setTimeout(r, 10));
      continue;
    }

    try {
      const doc = await parseEmail(job);

      batch.push(doc);

      if (batch.length >= BATCH_SIZE) {
        await flushBatch();
      }
    } catch (err) {
      console.error("[WORKER] Parse error:", err);
    }
  }
}

async function enqueue(job) {
  queue.push(job);
}

async function startWorkers() {
  console.log(
    `[WORKER] Starting ${WORKER_CONCURRENCY} workers`
  );

  for (let i = 0; i < WORKER_CONCURRENCY; i++) {
    workerLoop();
  }

  setInterval(flushBatch, 2000);
}

async function start() {
  console.log("[WORKER] Starting...");
  await connectDB();
  await connectRabbitMQWithRetry();
  await startWorkers();
  await consumeEmails(async (job) => {
    console.log("🚀 ~ start ~ job:", job)
    await enqueue(job);
  });

  console.log("[WORKER] Ready");
}

start().catch(console.error);