require("dotenv").config();
const app = require("./app");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to MongoDB via Prisma");

    app.listen(PORT, () => {
      console.log(`🚀 Restaurant API running smoothly on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
