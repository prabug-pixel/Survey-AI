import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { surveyRouter } from './routes/survey.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/survey', surveyRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Survey AI server running on http://localhost:${PORT}`);
});
