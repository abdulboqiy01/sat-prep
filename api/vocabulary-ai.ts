import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://kqxnhnjcpzlxsxnroxmx.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeG5obmpjcHpseHN4bnJveG14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzU0MDAyOSwiZXhwIjoyMTA5MTE2MDI5fQ.Caj7z9454M-3bjDsyXV_6uTSk9Rv_l3te5BbRm-BSFI';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  '';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function callGemini(prompt: string, systemInstruction?: string, isJson = false) {
  // Primary model with automatic fallback to flash-lite
  const models = [GEMINI_MODEL, 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const payload: any = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      if (isJson) {
        payload.generationConfig.responseMimeType = 'application/json';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || `HTTP ${res.status}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');
      return text;
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Failed to query Gemini API');
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    // 1. Verify user authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { action, word, words, target_word, sentence, user_answer, correct_answer } = body;

    if (!action) {
      return res.status(400).json({ error: 'Missing action parameter' });
    }

    // 2. Action: explain_word
    if (action === 'explain_word') {
      if (!word) return res.status(400).json({ error: 'Missing word parameter' });

      const prompt = `You are an expert SAT Reading and Writing Tutor.
Provide an educational breakdown for the advanced SAT vocabulary word: "${word}".
Explain it in simple, accessible English without losing nuance or precision.
Include:
1. "simple_explanation": 1-2 crystal-clear sentences.
2. "memory_hook": A memorable mnemonic or etymology breakdown.
3. "sat_trap": A common distractor or misconception students face on the SAT with this word.
4. "connotation": Whether it is positive, negative, or neutral.

Respond ONLY with valid JSON in this exact structure:
{
  "simple_explanation": "...",
  "memory_hook": "...",
  "sat_trap": "...",
  "connotation": "..."
}`;

      const raw = await callGemini(prompt, 'You are an elite SAT Verbal tutor.', true);
      const parsed = JSON.parse(raw);
      return res.status(200).json({ success: true, data: parsed });
    }

    // 3. Action: context_sentences
    if (action === 'context_sentences') {
      if (!word) return res.status(400).json({ error: 'Missing word parameter' });

      const prompt = `Generate 2 authentic SAT-style sentences demonstrating the word "${word}" in two distinct academic domains (e.g. History/Social Science and Natural Science/Literature).
Respond ONLY with valid JSON in this exact structure:
{
  "sentences": [
    {
      "domain": "Natural Science",
      "sentence": "...",
      "explanation": "Why this word fits precisely here."
    },
    {
      "domain": "History & Social Science",
      "sentence": "...",
      "explanation": "Why this word fits precisely here."
    }
  ]
}`;

      const raw = await callGemini(prompt, 'You are an SAT Reading passage author.', true);
      const parsed = JSON.parse(raw);
      return res.status(200).json({ success: true, data: parsed });
    }

    // 4. Action: compare_words
    if (action === 'compare_words') {
      const wordsToCompare = Array.isArray(words) ? words : [word, 'similar_word'];
      if (!wordsToCompare[0]) return res.status(400).json({ error: 'Missing words to compare' });

      const prompt = `Compare these often-confused SAT vocabulary words: ${wordsToCompare.join(', ')}.
Explain the fine shades of difference, connotations, and when the SAT tests one over the other.
Respond ONLY with valid JSON:
{
  "summary": "High-level summary of the distinction",
  "comparisons": [
    {
      "word": "${wordsToCompare[0]}",
      "nuance": "Specific nuance and appropriate context",
      "example": "SAT-style sentence"
    }
  ]
}`;

      const raw = await callGemini(prompt, 'You are an SAT vocabulary specialist.', true);
      const parsed = JSON.parse(raw);
      return res.status(200).json({ success: true, data: parsed });
    }

    // 5. Action: generate_sat_question
    if (action === 'generate_sat_question') {
      const target = word || target_word || 'Ambiguous';
      const prompt = `Create an authentic SAT Reading "Words in Context" question testing the word "${target}".
Include:
- A short, challenging academic passage (2-3 sentences) where "${target}" is used naturally.
- 4 multiple-choice options (A, B, C, D).
- The correct option ID.
- Detailed pedagogical explanation for why the correct answer fits the specific context and why common distractors fail.

Respond ONLY with valid JSON:
{
  "passage": "...",
  "prompt": "As used in the sentence, \\"${target}\\" most nearly means",
  "options": [
    {"id": "A", "text": "..."},
    {"id": "B", "text": "..."},
    {"id": "C", "text": "..."},
    {"id": "D", "text": "..."}
  ],
  "correct_option_id": "B",
  "explanation": "..."
}`;

      const raw = await callGemini(prompt, 'You are an official SAT Reading exam author.', true);
      const parsed = JSON.parse(raw);
      return res.status(200).json({ success: true, data: parsed });
    }

    // 6. Action: explain_answer
    if (action === 'explain_answer') {
      const prompt = `Explain why the user's answer ("${user_answer}") was ${user_answer === correct_answer ? 'CORRECT' : 'INCORRECT'} for the target SAT vocabulary word "${target_word}".
Sentence context: "${sentence || ''}"
Correct answer: "${correct_answer}"

Provide a concise, encouraging, high-yield explanation of the context clues and semantic trap.
Respond in JSON:
{
  "explanation": "...",
  "context_clue_breakdown": "..."
}`;

      const raw = await callGemini(prompt, 'You are an empathetic SAT tutor.', true);
      const parsed = JSON.parse(raw);
      return res.status(200).json({ success: true, data: parsed });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err: any) {
    console.error('vocabulary-ai error:', err);
    return res.status(500).json({ error: err.message || 'Internal AI error' });
  }
}
