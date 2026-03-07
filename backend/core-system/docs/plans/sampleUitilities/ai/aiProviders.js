/**
 * Supported AI provider identifiers. Use these instead of string literals.
 * Values match env AI_PROVIDER (e.g. gemini, groq, openai).
 */
export const AI_PROVIDERS = Object.freeze({
  GEMINI: 'gemini',
  GROQ: 'groq',
  OPENAI: 'openai',
});

export const DEFAULT_AI_PROVIDER = AI_PROVIDERS.GEMINI;

/**
 * @param {string} [defaultProvider] - Fallback when AI_PROVIDER is unset (default: GEMINI).
 * @returns {string} Current provider from env, lowercased.
 */
export function getCurrentAiProvider(defaultProvider = DEFAULT_AI_PROVIDER) {
  const raw = process.env.AI_PROVIDER || defaultProvider;
  return String(raw).toLowerCase();
}
