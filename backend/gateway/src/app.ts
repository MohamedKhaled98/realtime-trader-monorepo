import express, { type Request, type Response } from 'express';
import cors from 'cors';
import routes from './routes/index.js';

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json({ limit: '10kb' }));

    app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

    app.use('/v1', routes);

    return app;
}
