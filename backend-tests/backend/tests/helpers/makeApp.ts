import express from "express";
import { admin, user, website } from "src/routes";

/** Same mounting as src/app.ts, minus DB connection / listen / CORS */
export const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/admin", admin);
  app.use("/api/auth", user);
  app.use("/api", user);
  app.use("/api/website", website);
  return app;
};
