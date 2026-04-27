import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import bottleRoutes from "./routes/bottleRoutes.js";
import readingRoutes from "./routes/readingRoutes.js";

dotenv.config();

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: allowedOrigin === "*" ? "*" : allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Inventory backend is running",
    status: "OK",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

app.use("/api/bottles", bottleRoutes);
app.use("/api/readings", readingRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing. Add it in .env or Render Environment Variables.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
