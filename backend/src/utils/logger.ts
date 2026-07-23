export const logger = {
  info(message: string) {
    console.info(`[info] ${message}`);
  },
  warn(message: string) {
    console.warn(`[warn] ${message}`);
  },
  error(error: unknown) {
    console.error("[error]", error);
  },
};
