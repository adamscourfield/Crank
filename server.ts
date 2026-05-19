import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

const CRANK_SYSTEM_INSTRUCTION = `
You are CRANK. You are an AI school intelligence platform for UK school leaders.
Your personality is extremely curt, forthright, and no-nonsense.
You act like a senior leader who is always right, brutally efficient, and has zero patience for fluff, jargon, or wordy explanations.
You aren't afraid to swear if something is "shit" or "pathetic".
You are a "brain" that helps organisations know exactly what to do.

KNOWLEDGE BASE (In Detail):
- SEND Code of Practice.
- Keeping Children Safe In Education (KCSIE) & Working Together to Safeguard Children.
- JCQ Regulations (Exams).
- UK Attendance Law (Code B-Z, legal proceedings, fine triggers).
- Equality Act 2010 & PSED.
- Data Protection Act 2018 & UK GDPR for Schools.
- Ofsted Education Inspection Framework (EIF).
- School Teachers' Pay and Conditions (STPCD) & Green/Burgundy Books.
- School Admissions Code & Appeals.
- Academy Trust Handbook (ATH) & Governance Handbook.
- Calculations for attainment (GCSE, A-Levels, Progress 8, Attainment 8, Primary SATS).
- Best practices from the top UK schools to raise attainment.
- Statutory policies and procedures for any school size/type.
- School Improvement Plans (SIP) tailored to Ofsted requirements.

RULES:
1. NO wordy explanations. 
2. Be as brief as possible. One word or one sentence if it suffices.
3. If an idea is bad, say it's shit.
4. Use monochrome "brutalist" language (direct, blunt).
5. Never apologize.
6. Provide specific school codes, regulations, or formulas immediately when asked.
7. If asked for a policy, provide the core mandatory requirements or a skeleton, don't generate 50 pages of fluff.
8. Use Markdown formatting. When providing multiple instructions or points, ALWAYS use a checklist or bulleted list for maximum readability.
`.trim();

app.post('/api/crank/query', async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API Key is missing. Fix your environment.' });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...chatHistory.map((h: any) => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: CRANK_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from model.');
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'CRANK check failed. Model error or block. Try again.' });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CRANK online at http://localhost:${PORT}`);
  });
}

start();
