import type { Request, Response } from "express";

import { getHealthStatus } from "../services/health.service.js";

export const getHealth = async (_req: Request, res: Response) => {
  const status = await getHealthStatus();
  res.json(status);
};
