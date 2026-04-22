import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, async (req, res) => {
  try {
    const { messages, system } = req.body;

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // ✅ v1beta (not v1) — required for system_instruction
    // ✅ gemini-2.5-flash — current stable paid model
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();
    console.log('Gemini status:', response.status);

    if (!response.ok) {
      console.error('Gemini error:', data.error?.message);
      return res.status(response.status).json({
        content: [{ text: '⚠️ AI service error. Please try again shortly.' }]
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't get a response.";

    res.json({ content: [{ text }] });
  } catch (error) {
    console.error('AI route error:', error);
    res.status(500).json({ message: 'AI service error' });
  }
});

export default router;