import { config } from '../config/config';

export interface AiPersonalizationResult {
  subject: string;
  body: string;
}

/**
 * Generate personalized (subject, body) from base. If no AI key/provider, returns base as-is.
 * Can be extended with OpenAI, Groq, etc. — call their API and parse JSON { subject, body }.
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
  try {
    // Placeholder: when integrating e.g. OpenAI, build prompt from subjectBase/bodyBase,
    // call API with temperature 0.7–0.8, parse response as JSON { subject, body }.
    // On failure throw or return base.
    return { subject, body };
  } catch {
    return { subject, body };
  }
}
