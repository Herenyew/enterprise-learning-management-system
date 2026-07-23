import type { ErrorRequestHandler } from "express";

import { logger } from "../utils/logger.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error(error);

  res.status(500).json({
    message: "Internal server error",
  });
};
