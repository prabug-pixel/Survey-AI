import { Router, type Request, type Response } from 'express';
import { chat, generateSurvey, modifySurvey } from '../services/claude.service.js';

export const surveyRouter = Router();

// POST /api/survey/chat — conversational AI endpoint
surveyRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { conversationHistory = [], message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const result = await chat(conversationHistory, message);
    res.json(result);
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: 'AI service error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// POST /api/survey/generate — generate a full survey from context
surveyRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { industry, surveyType, audience, topics = [], additionalContext } =
      req.body;

    if (!industry || !surveyType || !audience) {
      res.status(400).json({
        error: 'industry, surveyType, and audience are required',
      });
      return;
    }

    const survey = await generateSurvey(
      industry,
      surveyType,
      audience,
      topics,
      additionalContext
    );
    res.json(survey);
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({
      error: 'Survey generation failed',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// POST /api/survey/modify — modify an existing survey
surveyRouter.post('/modify', async (req: Request, res: Response) => {
  try {
    const { currentSurvey, userRequest } = req.body;

    if (!currentSurvey || !userRequest) {
      res.status(400).json({
        error: 'currentSurvey and userRequest are required',
      });
      return;
    }

    const updated = await modifySurvey(currentSurvey, userRequest);
    res.json(updated);
  } catch (err) {
    console.error('Modify error:', err);
    res.status(500).json({
      error: 'Survey modification failed',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});
