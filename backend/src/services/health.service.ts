import { prisma } from "../config/database.js";

export const getHealthStatus = async () => {
  await prisma.$queryRaw`SELECT 1`;

  return {
    status: "ok",
    service: "enterprise-lms-backend",
    database: "connected",
    checkedAt: new Date().toISOString(),
  };
};
