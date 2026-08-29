import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import ticketRoutes from "./routes/tickets.js";

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "resolve-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found."
  });
});

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Resolve API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

start();
