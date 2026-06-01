import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { surveyRouter } from './routes/survey.routes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/survey', surveyRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Survey AI server running on http://localhost:${PORT}`);
  });
}

export default app;
