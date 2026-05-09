import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";
import authRoutes from "./auth.routes.js";
import newsRoutes from "./news.routes.js";
import quotesRoutes from "./quotes.routes.js";
import tickersRoutes from "./tickers.routes.js";

const router = Router();

router.use("/auth", authRoutes);

const protectedRouter = Router();
protectedRouter.use(requireAuth);
protectedRouter.use(tickersRoutes);
protectedRouter.use(quotesRoutes);
protectedRouter.use(newsRoutes);

router.use(protectedRouter);

export default router;
