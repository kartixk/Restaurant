require("dotenv").config();
const app = require("./app");
const prisma = require("./prismaClient");
const logger = require("./utils/logger");

const PREFERRED_PORT = parseInt(process.env.PORT || "4000", 10);

// ─── GLOBAL PROCESS-LEVEL CRASH GUARDS ──────────────────────────────────────
process.on("uncaughtException", (err) => {
  logger.error(`UNCAUGHT EXCEPTION! 💥 ${err.name}: ${err.message}`);
  // Log and continue — do NOT exit
});

process.on("unhandledRejection", (reason) => {
  logger.error(`UNHANDLED REJECTION! 💥 Reason: ${reason}`);
  // Log and continue — do NOT exit
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── AUTO PORT FINDER ────────────────────────────────────────────────────────
// If the preferred port is busy, try the next one (up to 10 attempts).
function startServer(port, attempt = 0) {
  if (attempt > 10) {
    logger.error("❌ Could not find a free port after 10 attempts. Giving up.");
    process.exit(1);
  }

  const server = app.listen(port, () => {
    logger.info(`🚀 Server running at http://localhost:${port}`);
    if (port !== PREFERRED_PORT) {
      logger.warn(
        `⚠️  Original port ${PREFERRED_PORT} was busy. Using port ${port} instead. ` +
        `Update VITE_API_URL in your frontend .env if needed: VITE_API_URL=http://localhost:${port}/api`
      );
    }
    checkDbConnection();
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.warn(`⚠️  Port ${port} is already in use. Trying port ${port + 1}...`);
      server.close();
      startServer(port + 1, attempt + 1);
    } else {
      logger.error(`❌ Server error: ${err.message}`);
      process.exit(1);
    }
  });

  // ─── GRACEFUL SHUTDOWN ──────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Gracefully shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info("Server closed cleanly.");
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
// ─────────────────────────────────────────────────────────────────────────────

startServer(PREFERRED_PORT);

// Background DB health check — logs the status but does NOT crash the server.
async function checkDbConnection() {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected successfully");
  } catch (err) {
    logger.warn(
      `⚠️  Database not reachable: ${err.message}. Check your MongoDB Atlas IP whitelist.`
    );
  }
}

