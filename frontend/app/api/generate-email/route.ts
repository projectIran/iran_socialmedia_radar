import { NextResponse } from "next/server";
import OpenAI from "openai";

// ============ Types ============

interface EmailRequest {
  person_name: string;
  person_role: string;
  person_email: string;
  person_side: "prowar" | "antiwar";
  topic: string;
  tone: string;
  sender_name?: string;
  sender_city?: string;
}

interface EmailResult {
  subject: string;
  body: string;
}

// ============ Prompt Engineering ============

const SYSTEM_PROMPT = `You are an expert political communications ghostwriter for the Iranian diaspora.

CRITICAL — ANTI-SPAM: Thousands of people will email the SAME recipient. If emails look similar, they get flagged as spam and DELETED. Every email MUST be radically different in structure, vocabulary, argument order, opening style, and personal angle. Treat each email as if a completely different human wrote it.

MANDATORY THEMES — Every email MUST include ALL of these:
1. TERRITORIAL INTEGRITY: Emphasize that Iran's territorial integrity is non-negotiable and inviolable.
2. PEOPLE'S WILL: Insist on full commitment to the will of the Iranian people to determine their own future system of government.
3. CIVILIAN PROTECTION: Insist on maximum care to prevent any harm to civilians.
4. PRINCE REZA PAHLAVI: Iranians inside and outside Iran recognize Prince Reza Pahlavi as their national representative. All major gatherings have been at his call, including the February 14 rallies in Munich, Los Angeles, and Toronto.

RULES:
1. Every email MUST be completely unique. Vary structure, vocabulary, argument order, personal angle, opening, closing, length (200-400 words).
2. Randomly choose: bullet points, numbered lists, pure prose, short paragraphs, or mixed formats.
3. Must feel like a real person wrote it. No AI clichés. No generic phrases.
4. Return ONLY valid JSON: {"subject": "...", "body": "..."}
5. No markdown, no code blocks, no extra text outside the JSON.
6. NEVER start two emails the same way. Vary first sentence dramatically.`;

const TOPIC_CONTEXT: Record<string, string> = {
  no_war: "the situation in Iran and the people's demand for freedom",
  diplomacy:
    "supporting the Iranian people's movement for self-determination",
  sanctions:
    "the Iranian people's struggle against the Islamic Republic",
  human_rights:
    "human rights violations by the Islamic Republic and the people's choice of leadership",
  peace:
    "lasting peace through supporting the Iranian people's chosen representative",
  regime_change:
    "supporting a democratic, secular future for Iran through its people's chosen leader",
};

const ANTIWAR_INSTRUCTION = `Recipient is a PROGRESSIVE figure who may oppose military action.
Your goal: CONVINCE them to support the Iranian people's cause. Key arguments:
- The Islamic Republic killed over 37,000 people in just 2 days. This is a terrorist regime by any definition.
- The IR has killed many American soldiers through its proxies over decades.
- Action against the Islamic Republic is FOR regional security and peace, not against it.
- The Iranian PEOPLE want this — it is their will, led by Prince Reza Pahlavi.
- Iran's territorial integrity will be preserved. This is about removing a terrorist regime, not attacking a nation.
- Maximum care for civilian protection is paramount.
- Be persuasive but respectful. Find common ground on human rights and civilian protection.`;

const PROWAR_INSTRUCTION = `Recipient is an IRAN LIBERATION ADVOCATE who supports the Iranian people.
Your goal: THANK them for standing with Iranians and encourage them to stay committed.
- Express gratitude for their support of the Iranian people's cause.
- Ask them to remain on the right side of history until the end of this revolution.
- Emphasize that Iranians inside and outside Iran are unified behind Prince Reza Pahlavi.
- Mention the February 14 rallies in Munich, Los Angeles, and Toronto as proof of unity.
- Stress territorial integrity, civilian protection, and the people's right to choose their future.
- Encourage them to continue advocating and to bring more colleagues on board.`;

const PERSPECTIVES = [
  "someone who left Iran as a child and remembers the fear",
  "someone whose elderly parents are trapped inside Iran",
  "a veteran who served in the Middle East and knows the IR's threat firsthand",
  "an Iranian-American doctor who treats refugees",
  "a university student who organized the Feb 14 Munich rally",
  "an entrepreneur who fled Iran after the 2009 protests",
  "someone who was imprisoned by the regime and bears the scars",
  "a worried parent with family still in Tehran",
  "a Middle East policy researcher at a think tank",
  "an Iranian artist whose work was banned by the regime",
  "someone who lost a brother to regime executions",
  "a tech worker fighting for internet freedom in Iran",
  "a refugee lawyer who helps Iranians seeking asylum",
  "a community organizer who attended the Feb 14 LA rally",
  "a nurse who volunteered during the Iran protests",
  "a second-generation Iranian-American discovering their heritage",
  "a journalist who covered the Woman Life Freedom movement",
  "a small business owner in the Iranian-American community",
  "a retired military analyst who studied IR proxy warfare",
  "a software engineer building tools for Iranian activists",
  "someone who marched in the Feb 14 Toronto rally",
  "a professor of human rights law",
  "a musician who uses art to amplify Iranian voices",
  "someone whose cousin was killed in the November 2019 massacre",
  "a political science student writing their thesis on Iran",
  "an Iranian-Canadian who organized solidarity events",
  "a grandmother who remembers Iran before the revolution",
  "a firefighter whose colleague served in the Middle East",
  "a social worker helping Iranian refugee families",
  "a teacher who educates students about Iran's history",
];

const STYLES = [
  "Lead with a personal anecdote, then policy argument.",
  "Start with a hard-hitting fact about the IR's crimes, then connect personally.",
  "Open with a rhetorical question, then build your case with evidence.",
  "Begin by acknowledging their work, then make a specific request.",
  "Lead with emotion about civilian suffering, then back with policy logic.",
  "Open with shared values of democracy and freedom, then your perspective.",
  "Start with what's at stake for real people inside Iran right now.",
  "Begin with a specific date or event (like the Feb 14 rallies), then expand.",
  "Open with a quote from an Iranian inside Iran, then your argument.",
  "Start with the big picture of regional security, then narrow to Iran.",
  "Lead with a comparison to other successful liberation movements.",
  "Open with a moral argument about standing with oppressed people.",
  "Begin with gratitude, then pivot to urgency and action items.",
  "Start with a vivid scene from a protest or rally, then make your case.",
  "Open by addressing a common misconception, then correct it with facts.",
];

const EMPHASIS_ANGLES = [
  "Focus heavily on territorial integrity — make it the central theme.",
  "Lead with the February 14 rallies as proof of Pahlavi's mandate.",
  "Center the email on civilian protection and humanitarian concerns.",
  "Emphasize the democratic will of the Iranian people above all.",
  "Focus on the IR's terrorism record and threat to regional security.",
  "Highlight the unity of Iranians worldwide behind Prince Reza Pahlavi.",
  "Center on the moral imperative of supporting oppressed people.",
  "Focus on the strategic/security benefits of a free Iran.",
  "Emphasize the IR's killing of American soldiers through proxies.",
  "Lead with the 37,000+ killed and the urgency of action.",
];

// ============ Helpers ============

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function refId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============ Prompt Builder ============

function buildPrompt(req: EmailRequest): string {
  const topicDesc = TOPIC_CONTEXT[req.topic] ?? req.topic;
  const sideInstruction =
    req.person_side === "prowar" ? PROWAR_INSTRUCTION : ANTIWAR_INSTRUCTION;

  let senderContext = "";
  if (req.sender_name || req.sender_city) {
    const parts: string[] = [];
    if (req.sender_name) {
      parts.push(`Sign the email as: ${req.sender_name}`);
    }
    if (req.sender_city) {
      parts.push(
        `The sender lives in: ${req.sender_city}. Mention this city naturally in the email.`
      );
    }
    senderContext = "\n" + parts.join("\n");
  }

  const wordCount = randomChoice([180, 220, 260, 300, 340]);
  const paragraphStyle = randomChoice([
    "Use 3-4 short paragraphs.",
    "Use 2 longer paragraphs.",
    "Mix a short opening paragraph, bullet points, then a closing paragraph.",
    "Use 4-5 very short paragraphs for quick reading.",
    "Use one flowing paragraph with a separate closing.",
  ]);

  const seed = `${refId()}-${10000 + Math.floor(Math.random() * 90000)}-${Date.now() % 100000}`;

  return `Write a completely unique email to ${req.person_name} (${req.person_role}).

CONTEXT: ${topicDesc}
RECIPIENT TYPE: ${sideInstruction}
WRITING STYLE: ${randomChoice(STYLES)}
WRITER'S PERSPECTIVE: ${randomChoice(PERSPECTIVES)}
EMPHASIS: ${randomChoice(EMPHASIS_ANGLES)}
FORMAT: ${paragraphStyle}
LENGTH: ~${wordCount} words
${senderContext}
UNIQUENESS SEED: ${seed}

REMEMBER: This email MUST be radically different from any other. Vary vocabulary, sentence structure, argument order. The recipient may receive 5000+ emails — yours must stand out.

Return ONLY: {"subject": "...", "body": "..."}`;
}

// ============ Response Parser ============

function parseLLMResponse(content: string): EmailResult {
  let cleaned = content.trim();

  if (cleaned.startsWith("```")) {
    const firstNewline = cleaned.indexOf("\n");
    if (firstNewline !== -1) {
      cleaned = cleaned.slice(firstNewline + 1);
    }
    const lastFence = cleaned.lastIndexOf("```");
    if (lastFence !== -1) {
      cleaned = cleaned.slice(0, lastFence);
    }
    cleaned = cleaned.trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.subject && parsed.body) return parsed;
  } catch {
    // fall through to regex
  }

  const subjectBodyMatch = cleaned.match(
    /\{[^{}]*"subject"[^{}]*"body"[^{}]*\}/s
  );
  const genericMatch = !subjectBodyMatch
    ? cleaned.match(/\{.*\}/s)
    : null;
  const jsonMatch = subjectBodyMatch ?? genericMatch;

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.subject && parsed.body) return parsed;
    } catch {
      // fall through to line-based extraction
    }
  }

  const lines = cleaned.split("\n");
  let subject = "Regarding Iran Policy";
  let body = cleaned;
  for (const line of lines) {
    if (line.toLowerCase().startsWith("subject:")) {
      subject = line.split(":").slice(1).join(":").trim();
      body = cleaned.replace(line, "").trim();
      break;
    }
  }

  return { subject, body };
}

// ============ OpenAI Generation ============

async function generateWithOpenAI(req: EmailRequest): Promise<EmailResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(req) },
    ],
    temperature: 1.2,
    max_tokens: 1000,
    frequency_penalty: 0.8,
    presence_penalty: 0.6,
  });

  const content = response.choices[0]?.message?.content;
  if (!content?.trim()) {
    throw new Error("Empty response from OpenAI");
  }

  return parseLLMResponse(content);
}

// ============ Route Handler ============

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "no_api_key",
        message:
          "No OPENAI_API_KEY configured. Use client-side generation.",
      },
      { status: 503 }
    );
  }

  let body: EmailRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.person_name || !body.person_role || !body.person_email || !body.topic) {
    return NextResponse.json(
      { error: "Missing required fields: person_name, person_role, person_email, topic" },
      { status: 400 }
    );
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await generateWithOpenAI(body);
      return NextResponse.json(result);
    } catch (e) {
      lastError = e;
      await sleep(500 * (attempt + 1));
    }
  }

  return NextResponse.json(
    {
      subject: "Generation Error — Please Try Again",
      body: `Failed after 3 attempts.\nError: ${lastError instanceof Error ? lastError.message : String(lastError)}\n\nPlease click Regenerate.`,
    },
    { status: 500 }
  );
}
