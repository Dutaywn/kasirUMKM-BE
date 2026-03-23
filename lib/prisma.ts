import "dotenv/config";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "../generated/prisma/client.js";



const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }

  return new PrismaClient({
    // Explicitly pass the URL as accelerateUrl as requested by the error message.
    // In Prisma 6/7, when using engineType: "client", it must be told to use the proxy URL.
    accelerateUrl: url,
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  } as any).$extends(withAccelerate());
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}