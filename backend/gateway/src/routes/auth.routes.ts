import { Router, type Request, type Response } from "express";
import { signAuthToken } from "../auth/service.js";
import { config } from "../config.js";

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  const username = typeof req.body?.username === "string"
    ? req.body.username.trim()
    : "";

  if (!username) {
    res.status(400).json({ error: "username is required" });
    return;
  }

  const user = { username };
  const token = signAuthToken(user);
  res.json({ token, user, expiresIn: config.JWT_EXPIRES_IN_SECONDS });
});

export default router;
