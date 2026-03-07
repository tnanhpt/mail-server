import amqplib from "amqplib";
import { config } from "../config/index.js";

let connection;
let channel;

const QUEUE = "email.incoming";

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
    connection = await amqplib.connect(config.rabbitmq.url, {
      heartbeat: 60,
      timeout: 10000,
    });

    channel = await connection.createConfirmChannel();

    await channel.assertQueue(QUEUE, {
      durable: true,
    });

    console.log(`\n[RABBITMQ] Kết nối thành công!`);
    console.log(`   • Queue: ${QUEUE}`);
    console.log(`   • Thời gian: ${getVietnamTime()}\n`);

    connection.on("error", (err) => {
      console.error(`[RABBITMQ] Lỗi kết nối: ${err.message}`);
    });

    connection.on("close", async () => {
      console.warn("[RABBITMQ] Kết nối bị đóng → reconnect...");
      channel = null;
      connection = null;

      setTimeout(connectRabbitMQWithRetry, 5000);
    });

    return true;
  } catch (err) {
    console.error(`[RABBITMQ] Kết nối thất bại: ${err.message}`);
    return false;
  }
}

export async function connectRabbitMQWithRetry() {
  let isConnected = false;

  while (!isConnected) {
    isConnected = await connectRabbitMQ();

    if (!isConnected) {
      console.log("   • Thử lại sau 5 giây...\n");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  return true;
}

export async function publishEmail(message) {
  if (!channel) throw new Error("RabbitMQ chưa kết nối");
  console.log("Nhận được email ở địa chỉ:", message?.rcptTo[0]);

  const buffer = Buffer.from(JSON.stringify(message));

  const ok = channel.sendToQueue(
    QUEUE,
    buffer,
    {
      persistent: true,
    },
    (err) => {
      if (err) {
        console.error("[RABBITMQ] Publish error:", err);
      }
    },
  );

  if (!ok) {
    await new Promise((resolve) => channel.once("drain", resolve));
  }
}

export async function consumeEmails(handler) {
  if (!channel) throw new Error("RabbitMQ chưa kết nối");

  channel.prefetch(50);

  console.log(`[RABBITMQ] Worker bắt đầu lắng nghe queue: ${QUEUE}`);

  await channel.consume(QUEUE, async (msg) => {
    console.log("🚀 ~ consumeEmails ~ msg:", msg)
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
