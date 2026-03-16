import { config } from '../config/config';

export interface AiPersonalizationResult {
  subject: string;
  body: string;
}

const AI_PROVIDERS = Object.freeze({
  GEMINI: 'gemini',
  GROQ: 'groq',
  OPENAI: 'openai',
});

const EMAIL_PERSONALIZE_PROMPT = `You are rewriting an email so it looks like a unique, human-written message—not a copy-paste or bulk template. Each version should feel as if a different person wrote it, while keeping the same core message and intent.

Rules:
- PRESERVE the main topic, facts, and call-to-action exactly. Do not change the meaning or add/remove important points.
- REWRITE strongly: use different sentence structures, different word choices, different order of phrases where it still flows naturally. Avoid sounding like a paraphrase; aim for a fresh, natural rewrite that a human would write.
- Keep the same language (Persian or English) as the input and the same level of formality.
- The result must look like one person wrote this email to another—not like a template sent to many people.

Formatting for the body:
- Use clear paragraph breaks: put a blank line (double newline) between paragraphs.
- Keep paragraphs reasonably short (a few sentences each) for readability.
- Do not use markdown or HTML; use only plain text and newlines (\\n) for line breaks.
- The result should look like a well-formatted email when displayed with line breaks preserved.

Output ONLY valid JSON with exactly two keys: "subject" and "body". No markdown code blocks, no explanation outside the JSON.
Example: {"subject":"...","body":"First paragraph.\\n\\nSecond paragraph.\\n\\nClosing."}`;

function parseEmailPersonalizationJson(text: string | null | undefined): AiPersonalizationResult | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim().replace(/^```json?\s*|\s*```$/g, '');
  try {
    const o = JSON.parse(trimmed) as { subject?: unknown; body?: unknown };
    if (o && typeof o.subject === 'string' && typeof o.body === 'string') return { subject: o.subject, body: o.body };
  } catch {
    // ignore
  }
  return null;
}

function getCurrentAiProvider(): string {
  const raw = config.aiProvider || AI_PROVIDERS.GEMINI;
  return String(raw).toLowerCase();
}

async function personalizeWithGemini(baseSubject: string, baseBody: string): Promise<AiPersonalizationResult | null> {
  const apiKey = config.aiApiKey;
  if (!apiKey) return null;
  const prompt = `${EMAIL_PERSONALIZE_PROMPT}\n\nBase subject:\n${baseSubject || ''}\n\nBase body:\n${baseBody || ''}`;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.78, maxOutputTokens: 2048 },
      }),
    }
  );
  if (!response.ok) return null;
  const data = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return parseEmailPersonalizationJson(text);
}

async function personalizeWithGroq(baseSubject: string, baseBody: string): Promise<AiPersonalizationResult | null> {
  const apiKey = config.aiApiKey;
  if (!apiKey) return null;
  const prompt = `${EMAIL_PERSONALIZE_PROMPT}\n\nBase subject:\n${baseSubject || ''}\n\nBase body:\n${baseBody || ''}`;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.78,
      max_tokens: 2048,
    }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content;
  return parseEmailPersonalizationJson(text);
}

async function personalizeWithOpenAI(baseSubject: string, baseBody: string): Promise<AiPersonalizationResult | null> {
  const apiKey = config.aiApiKey;
  if (!apiKey) return null;
  const prompt = `${EMAIL_PERSONALIZE_PROMPT}\n\nBase subject:\n${baseSubject || ''}\n\nBase body:\n${baseBody || ''}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.78,
      max_tokens: 2048,
    }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content;
  return parseEmailPersonalizationJson(text);
}

/**
 * Generate personalized (subject, body) from base using configured AI provider (Gemini, Groq, OpenAI).
 * If no AI key/provider, returns base as-is. On API failure, returns base unchanged.
 */
export async function generatePersonalizedEmail(
  subjectBase: string,
  bodyBase: string
): Promise<AiPersonalizationResult> {
  const subject = (subjectBase || '').trim() || 'No subject';
  const body = (bodyBase || '').trim() || '';
  if (!config.aiApiKey || !config.aiProvider) {
    return { subject, body };
  }
  const provider = getCurrentAiProvider();
  let result: AiPersonalizationResult | null = null;
  try {
    switch (provider) {
      case AI_PROVIDERS.GEMINI:
        result = await personalizeWithGemini(subjectBase, bodyBase);
        break;
      case AI_PROVIDERS.GROQ:
        result = await personalizeWithGroq(subjectBase, bodyBase);
        break;
      case AI_PROVIDERS.OPENAI:
        result = await personalizeWithOpenAI(subjectBase, bodyBase);
        break;
      default:
        result = await personalizeWithGemini(subjectBase, bodyBase);
    }
  } catch (e) {
    console.warn('generatePersonalizedEmail error:', (e as Error)?.message);
  }
  return result && result.subject != null && result.body != null ? result : { subject, body };
}
