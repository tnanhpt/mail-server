// src/api/middlewares/auth.js
import { config } from "../../config/index.js";
import jwt from "jsonwebtoken";

export function apiKeyAuth(req, res, next) {
  const key = req.headers["x-api-key"] || req.query.api_key;
  if (key !== config.apiKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
}

export function jwtAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}