// src/db/mongo.js
import mongoose from "mongoose";
import { config } from "../config/index.js";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(config.mongo.url, {
    serverSelectionTimeoutMS: 5000,
  });
  isConnected = true;
  console.log("MongoDB connected");
}

const emailSchema = new mongoose.Schema({
  message_id: String,
  subject: String,
  from: String,
  to: [String],
  original_to: [String],
  cc: [String],
  // headers: Object,
  text: String,
  html: String,
  // attachments: [Object],
  received_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
  // file_id: String,
  read: { type: Boolean, default: false },
  raw_size: Number,
});

emailSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const Email = mongoose.model("Email", emailSchema);
