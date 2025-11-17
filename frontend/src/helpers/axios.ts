// src/lib/axios.ts
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "8jD5Yg0qeuhc36TUKJwXfQwIquwIul9Qtbw0WNX"
  },
});

export default API;
