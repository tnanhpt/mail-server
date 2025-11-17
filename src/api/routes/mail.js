// src/api/routes/mail.js
import express from "express";
import { Email } from "../../db/mongo.js";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { config } from "../../config/index.js";

const router = express.Router();

const rateLimiter = new RateLimiterMemory({
  points: config.rateLimit.max,
  duration: config.rateLimit.windowMs / 1000,
});

router.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: "Too Many Requests" });
  }
});

// router.get("/", async (req, res) => {
//   const emails = await Email.find()
//     .sort({ received_at: -1 })
//     .select("-raw -__v")
//     .limit(50);
//   res.json(emails);
// });

router.get("/:id", async (req, res) => {
  const email = await Email.findById(req.params.id);
  if (!email) return res.status(404).json({ error: "Not found" });
  await Email.updateOne({ _id: req.params.id }, { read: true });
  res.json(email);
});

router.get("/by-email/:address", async (req, res) => {
  const { address } = req.params;
  if (!address || !address.includes("@")) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const normalized = address.toLowerCase().trim();

  try {
    const emails = await Email.find({
      $or: [{ to: normalized }, { cc: normalized }],
    })
      .sort({ received_at: -1 })
      .select(
        "-raw -__v subject text html received_at from to read expires_at"
      )
      .limit(50)
      .lean();

    res.json({
      // query: normalized,
      count: emails.length,
      emails,
    });
  } catch (err) {
    console.error("[API] Lỗi tìm email theo address:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/messages", async (req, res) => {
  const emails = await Email.find()
    .sort({ received_at: -1 })
    .select("-raw -__v")
    .limit(50);
  res.json(emails);
});

router.post("/read/:id", async (req, res) => {
  try {
    await Email.findByIdAndUpdate(req.params.id, {
      $set: {
        read: true,
      },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.json({
      success: false,
    });
  }
});

router.delete("/:id", async (req, res) => {
  await Email.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

export default router;
