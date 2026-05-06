/**
 * ============================================================
 *  RumahPeneliti — Clean Architecture Backend
 * ============================================================
 *
 *  Struktur folder:
 *    src/
 *    ├── index.js          ← File ini (entry point, wiring saja)
 *    ├── db.js             ← Database connection + schema
 *    ├── routes/           ← Definisi route (URL mapping)
 *    ├── controllers/      ← Business logic (proses data)
 *    ├── services/         ← External integrations (blockchain, AI)
 *    ├── middleware/        ← Express middleware (error handler, dll)
 *    └── utils/            ← Helper functions (reusable)
 *
 *  Prinsip Clean Architecture:
 *    - Route hanya mapping URL → Controller
 *    - Controller hanya proses business logic (validasi, panggil service)
 *    - Service hanya handle external systems (blockchain, AI, storage)
 *    - Utils hanya helper functions murni (no side effects)
 *
 * ============================================================
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const rateLimit = require("express-rate-limit");

// ── Import Routes ──
const paperRoutes = require("./routes/papers");
const articleRoutes = require("./routes/articles");
const nftRoutes = require("./routes/nfts");
const pipelineRoutes = require("./routes/pipeline");
const analyticsRoutes = require("./routes/analytics");
const profileRoutes = require("./routes/profile");
const verifyRoutes = require("./routes/verify");
const authRoutes = require("./routes/auth");

// ── Import Middleware ──
const { errorHandler, asyncHandler } = require("./middleware/error-handler");

// ============================================================
//  EXPRESS APP SETUP
// ============================================================

const app = express();

// ── CORS — Lock to allowed origins in production ──
const isDev = process.env.NODE_ENV !== "production";
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : []),
];

app.use(cors({
  origin: isDev ? true : allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// ── Rate Limiting ──
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts, please try again later" },
});

app.use(globalLimiter);

// Static file serving untuk uploads
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));

// ============================================================
//  MULTER — File Upload Configuration
// ============================================================

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Maks 50MB
});

// ============================================================
//  ROUTES — Register all route modules
// ============================================================

app.use("/api/papers", paperRoutes(upload));
app.use("/api/articles", articleRoutes);
app.use("/api/nfts", nftRoutes);
app.use("/api/pipeline", pipelineRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/auth", authLimiter, authRoutes);

// Health check (root level)
app.get("/api/health", require("./controllers/health-controller"));

// Wallet status
app.get("/api/wallet/status", require("./controllers/wallet-controller"));

// Activity feed (also available under /api/papers/activity)
const { getActivity } = require("./controllers/paper-controller");
app.get("/api/activity", asyncHandler(getActivity));

// ============================================================
//  ERROR HANDLING — Must be registered AFTER all routes
// ============================================================

app.use(errorHandler);

// ============================================================
//  START SERVER
// ============================================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🏛️ RumahPeneliti API running on port ${PORT}`);
  console.log(`   Network: 0G Mainnet (Chain ID: 16661)`);
  console.log(`   RPC: ${process.env.RPC_URL || "https://evmrpc.0g.ai"}`);
});

module.exports = app;
