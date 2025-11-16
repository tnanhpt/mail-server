// test-send-email.js
import { SMTPClient } from "smtp-client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cấu hình SMTP giả (chạy local)
const smtp = new SMTPClient({
  host: "192.168.100.241",
  port: 25, // port SMTP của bạn
});

// Email mẫu (có thể thay bằng file .eml thật)
const sampleEmail = `
From: test@sender.com
To: user@example.com
Subject: Test Email Dev - ${new Date().toLocaleString("vi-VN")}
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Xin chào! Đây là email test từ môi trường dev.
Thời gian: ${new Date().toLocaleString("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
})}
ID: ${Math.random().toString(36).substr(2, 9)}

Có attachment giả: report.pdf
`.trim();

async function sendTestEmail() {
  try {
    console.log("Đang gửi email test...");
    await smtp.connect();
    await smtp.greet({ hostname: "localhost" });
    await smtp.mail({ from: "test@sender.com" });
    await smtp.rcpt({ to: "user@example.com" });
    console.log(sampleEmail);
    
    await smtp.data(sampleEmail);
    await smtp.quit();
    console.log("Email test đã được gửi thành công!");
    console.log("Xem tại: http://localhost:3000/api/mails");
    console.log("Header: x-api-key: your_api_key_here");
  } catch (err) {
    console.log("🚀 ~ sendTestEmail ~ err:", err)
    console.error("Lỗi gửi email test:", err.message);
  }
}

// Chạy
sendTestEmail();
