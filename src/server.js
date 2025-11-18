// src/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/index.js";
import { connectDB } from "./db/mongo.js";
import { createSMTPServer } from "./smtp/server.js";

import mailRoutes from "./api/routes/mail.js";
import { apiKeyAuth } from "./api/middlewares/auth.js";
import { connectRabbitMQ, connectRabbitMQWithRetry } from "./smtp/rabbitmq.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));
app.use("/api/v1/mails", apiKeyAuth, mailRoutes);

async function start() {
  await connectDB();
  await connectRabbitMQWithRetry();
  await createSMTPServer();
  app.listen(config.port, config.host, () => {
    console.log(`API running on http://${config.host}:${config.port}`);
  });
}
start().catch(console.error);