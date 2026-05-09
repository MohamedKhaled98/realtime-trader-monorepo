import { Router, type Request, type Response } from "express";
import axios from "axios";
import { config } from "../config.js";
import { client } from "../redis.js";

const router = Router();

router.get("/news", async (req: Request, res: Response) => {
  const category = req.query.category ?? "general";

  const cacheKey = `news:${category}`;
  const cachedNews = await client.get(cacheKey);
  if (cachedNews) {
    res.send(JSON.parse(cachedNews));
    return;
  }

  const response = await axios.get(
    `${config.FINNHUB_URL}/news?category=${encodeURIComponent(category as string)}&token=${config.FINNHUB_TOKEN}`,
  );

  await client.set(cacheKey, JSON.stringify(response.data), "EX", 300);
  res.send(response.data);
});

export default router;
