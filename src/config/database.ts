import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log("🔌 Database disconnected");
}
