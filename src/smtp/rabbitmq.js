import amqplib from "amqplib";
import { config } from "../config/index.js";

let channel;
const QUEUE = "email.incoming";

/**
 * Lấy thời gian hiện tại theo múi giờ Việt Nam (UTC+7)
 */
export function getVietnamTime() {
  return new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export async function connectRabbitMQ() {
  console.log(`[RABBITMQ] Đang kết nối tới RabbitMQ...`);

  try {
    const conn = await amqplib.connect(config.rabbitmq.url, {
      heartbeat: 60,
      timeout: 10000,
    });

    channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    console.log(`\n[RABBITMQ] Kết nối thành công!`);
    console.log(`   • Queue: ${QUEUE}`);
    console.log(`   • Thời gian: ${getVietnamTime()}\n`);

    // START LISTEN EVENTS (không retry ở đây)
    conn.on("error", (err) => {
      console.error(`[RABBITMQ] Lỗi kết nối: ${err.message}`);
    });

    conn.on("close", () => {
      console.warn(`[RABBITMQ] Kết nối bị đóng.`);
    });

    return true; // success

  } catch (err) {
    console.error(`[RABBITMQ] Kết nối thất bại: ${err.message}`);
    return false; // fail
  }
}

export async function connectRabbitMQWithRetry() {
  let isConnected = false;

  while (!isConnected) {
    isConnected = await connectRabbitMQ();

    if (!isConnected) {
      console.log(`   • Thử lại sau 5 giây...\n`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  return true;
}

export async function publishEmail(message) {
  if (!channel) throw new Error("RabbitMQ chưa kết nối");

  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
}

export async function consumeEmails(handler) {
  if (!channel) throw new Error("RabbitMQ chưa kết nối");
  channel.prefetch(10);
  console.log(`[RABBITMQ] Worker bắt đầu lắng nghe queue: ${QUEUE}`);
  await channel.consume(QUEUE, async (msg) => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      await handler(data);
      channel.ack(msg);
    } catch (err) {
      console.error("[WORKER] Lỗi xử lý:", err);
      channel.nack(msg, false, false);
    }
  });
}