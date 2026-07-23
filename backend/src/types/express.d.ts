declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        organizationId: string;
        roles: string[];
      };
    }
  }
}

export {};
