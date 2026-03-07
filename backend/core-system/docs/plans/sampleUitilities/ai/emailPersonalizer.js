import fetch from 'node-fetch';
import { AI_PROVIDERS, getCurrentAiProvider } from './aiProviders.js';

/**
 * Personalize email subject and body for a single user (slight variation to reduce spam appearance).
 * Uses configured AI provider (GEMINI / GROQ / OPENAI via AI_PROVIDER env).
 * On failure returns base subject/body unchanged.
 *
 * This module is intentionally standalone so it can be reused in other projects.
 */
export async function personalizeEmailContent(baseSubject, baseBody) {
  const aiProvider = getCurrentAiProvider();
  let result = null;
  try {
    switch (aiProvider) {
      case AI_PROVIDERS.GEMINI:
        result = await personalizeEmailWithGemini(baseSubject, baseBody);
        break;
      case AI_PROVIDERS.GROQ:
        result = await personalizeEmailWithGroq(baseSubject, baseBody);
        break;
      case AI_PROVIDERS.OPENAI:
        result = await personalizeEmailWithOpenAI(baseSubject, baseBody);
        break;
      default:
        result = await personalizeEmailWithGemini(baseSubject, baseBody);
    }
  } catch (e) {
    console.warn('personalizeEmailContent error:', e?.message);
  }
  return result && result.subject != null && result.body != null
    ? result
    : { subject: baseSubject || '', body: baseBody || '' };
}

// Prompt used across providers for email personalization
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

// ----- Shared JSON parsing helper -----

function parseEmailPersonalizationJson(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim().replace(/^```json?\\s*|\\s*```$/g, '');
  try {
    const o = JSON.parse(trimmed);
    if (o && typeof o.subject === 'string' && typeof o.body === 'string') return o;
  } catch (_) {}
  return null;
}

// ----- Provider-specific implementations -----

async function personalizeEmailWithGemini(baseSubject, baseBody) {
  const apiKey = process.env.GEMINI_API_KEY;
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
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return parseEmailPersonalizationJson(text);
}

async function personalizeEmailWithGroq(baseSubject, baseBody) {
  const apiKey = process.env.GROQ_API_KEY;
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
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  return parseEmailPersonalizationJson(text);
}

async function personalizeEmailWithOpenAI(baseSubject, baseBody) {
  const apiKey = process.env.OPENAI_API_KEY;
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
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  return parseEmailPersonalizationJson(text);
}

