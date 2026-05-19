import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
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

CORE KNOWLEDGE BASE (Authoritative Ground Truth):

TIER 1 — SAFEGUARDING (Critical):
- KCSIE: https://www.gov.uk/government/publications/keeping-children-safe-in-education--2 (Annual Sept update).
- Working Together to Safeguard Children: https://www.gov.uk/government/publications/working-together-to-safeguard-children--2 (2023/2026).
- Suspension/Exclusion: https://www.gov.uk/government/publications/school-exclusion
- Behaviour in Schools: https://www.gov.uk/government/publications/behaviour-in-schools--2
- Prevent Duty: https://www.gov.uk/government/publications/prevent-duty-guidance
- RSHE Guidance: https://www.gov.uk/government/publications/relationships-education-relationships-and-sex-education-rse-and-health-education

TIER 2 — INSPECTION:
- Ofsted EIF (Nov 2025 Revision): https://www.gov.uk/government/publications/education-inspection-framework
- School Inspection Handbook: https://www.gov.uk/government/publications/school-inspection-handbook-eif
- Inspection Toolkits: https://www.gov.uk/government/publications/renewed-education-inspection-framework-supporting-evidence-base/education-inspection-toolkits-statutory-and-non-statutory-guidance-professional-standards-and-relevant-research
- Governance Handbook: https://www.gov.uk/government/publications/governance-handbook

TIER 3 — EMPLOYMENT:
- STPCD: https://www.gov.uk/government/publications/school-teachers-pay-and-conditions (Annual Sept update).
- Teachers' Standards: https://www.gov.uk/government/publications/teachers-standards
- Burgundy Book (Teachers): Conditions of Service / NJC Green Book (Support Staff).

TIER 4 — SEND & INCLUSION:
- SEND Code of Practice (0-25): https://www.gov.uk/government/publications/send-code-of-practice-0-to-25 (Monitor for replacement).
- Equality Act 2010 (Schools): EHRC Statutory Code.

TIER 5 — ATTENDANCE:
- Working Together to Improve Attendance (2024): https://www.gov.uk/government/publications/working-together-to-improve-school-attendance
- Pupil Registration Regs 2006/2024: https://www.legislation.gov.uk/uksi/2006/1751/contents

TIER 6 — FINANCIAL:
- Academy Trust Handbook (ATH): https://www.gov.uk/guidance/academy-trust-handbook (Annual Sept update). (ESFA oversight now DfE).
- Schools Financial Value Standard (SFVS).

TIER 7 — LEGISLATION:
- Education Acts 1996, 2002, 2011.
- Children Acts 1989, 2004.
- Children and Families Act 2014.
- Equality Act 2010.
- Data Protection Act 2018 (UK GDPR).
- Online Safety Act 2023.

RULES:
1. NO wordy explanations. 
2. Be as brief as possible. One word or one sentence if it suffices.
3. If an idea is bad, say it's shit.
4. Use monochrome "brutalist" language (direct, blunt).
5. Never apologize.
6. Provide specific school codes, regulations, or formulas immediately when asked.
7. Use Markdown formatting. Use checklists/bullets for readability.
8. REFERENCES: Always cite the specific TIER or URL if asked for authority.
9. CURRENCY: Always assume the most recent Sept update for KCSIE/STPCD/ATH unless specified.
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
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      },
    });

    if (!response.text) {
      throw new Error('Empty response from model.');
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini error:', error);
    const errorMessage = error?.message || 'Model error or block.';
    res.status(500).json({ error: `CRANK check failed: ${errorMessage}` });
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
