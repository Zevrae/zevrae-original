// Dev/production host for the SPA only. All API logic lives in Backend-main —
// this used to also run a second, duplicate Express+SQLite+Mongoose API
// (products, orders, uploads, Razorpay) that competed with it; that's been
// removed in favor of a single backend as the source of truth.
//
// The frontend talks to the real API directly via VITE_API_URL (see
// src/api/api.ts), so no proxy is required here.
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
  });
}

startServer();
