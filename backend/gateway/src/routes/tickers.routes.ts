import { Router, type Request, type Response } from "express";
import axios from "axios";
import { AVAILABLE_TICKERS } from "../constants.js";
import { config } from "../config.js";

const router = Router();

router.get("/tickers", async (_req: Request, res: Response) => {
  res.send({ count: AVAILABLE_TICKERS.length, result: AVAILABLE_TICKERS });
});

router.get("/stock/search", async (req: Request, res: Response) => {
  const { q } = req.query;
  const response = await axios.get(
    `${config.FINNHUB_URL}/search?q=${q}&exchange=US&token=${config.FINNHUB_TOKEN}`,
  );
  res.send(response.data);
});

export default router;
