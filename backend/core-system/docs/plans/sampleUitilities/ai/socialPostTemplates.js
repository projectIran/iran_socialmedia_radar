import fetch from 'node-fetch';
import { AI_PROVIDERS, getCurrentAiProvider } from './aiProviders.js';

/**
 * Shared prompt helpers for social post templates.
 * These are kept framework-agnostic so they can be reused.
 */
function getUsageRequirement(linkType) {
  const isInstagram = linkType === 'instagram_post' || linkType === 'instagram_reel';
  return isInstagram
    ? '- Must be suitable for posting as a comment under the Instagram post/reel (can be short or longer, supportive).'
    : '- Must be suitable for reposting on X (Twitter)';
}

function getLengthRequirement(linkType) {
  const isInstagram = linkType === 'instagram_post' || linkType === 'instagram_reel';
  return isInstagram
    ? '- The text can be short or longer as needed (e.g. up to 1000 characters or more for a meaningful Instagram comment).'
    : '- The text should be concise but can be longer if needed (preferably under 500 characters)';
}

/**
 * Generate 1 / 2 / 4 post templates.
 * Public API used by the bot; split out so other projects can import directly.
 */
export async function generatePostTemplate(link, linkType, description = null, postContent = null) {
  const aiProvider = getCurrentAiProvider();
  try {
    switch (aiProvider) {
      case AI_PROVIDERS.GEMINI:
        return await generateWithGemini(link, linkType, description, postContent);
      case AI_PROVIDERS.GROQ:
        return await generateWithGroq(link, linkType, description, postContent);
      case AI_PROVIDERS.OPENAI:
        return await generateWithOpenAI(link, linkType, description, postContent);
      default:
        console.warn(`Unknown AI provider: ${aiProvider}, falling back to Gemini`);
        return await generateWithGemini(link, linkType, description, postContent);
    }
  } catch (error) {
    console.error('Error generating template with AI:', error?.message || error);
    return null;
  }
}

export async function generateTwoPostTemplates(link, linkType, description = null, postContent = null) {
  const aiProvider = getCurrentAiProvider();
  try {
    switch (aiProvider) {
      case AI_PROVIDERS.GEMINI:
        return await generateTwoWithGemini(link, linkType, description, postContent);
      case AI_PROVIDERS.GROQ:
        return await generateTwoWithGroq(link, linkType, description, postContent);
      case AI_PROVIDERS.OPENAI:
        return await generateTwoWithOpenAI(link, linkType, description, postContent);
      default:
        console.warn(`Unknown AI provider: ${aiProvider}, falling back to Groq`);
        return await generateTwoWithGroq(link, linkType, description, postContent);
    }
  } catch (error) {
    console.error('Error generating templates with AI:', error?.message || error);
    return null;
  }
}

export async function generateFourPostTemplates(link, linkType, description = null, postContent = null) {
  const aiProvider = getCurrentAiProvider();
  try {
    switch (aiProvider) {
      case AI_PROVIDERS.GEMINI:
        return await generateFourWithGemini(link, linkType, description, postContent);
      case AI_PROVIDERS.GROQ:
        return await generateFourWithGroq(link, linkType, description, postContent);
      case AI_PROVIDERS.OPENAI:
        return await generateFourWithOpenAI(link, linkType, description, postContent);
      default:
        console.warn(`Unknown AI provider: ${aiProvider}, falling back to Groq`);
        return await generateFourWithGroq(link, linkType, description, postContent);
    }
  } catch (error) {
    console.error('Error generating templates with AI:', error?.message || error);
    return null;
  }
}

// ----- Provider-specific helpers for a single template -----

async function generateWithGemini(link, linkType, description, postContent = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, skipping AI template generation');
    return null;
  }

  const linkTypeLabel = {
    twitter_post: 'Twitter post',
    instagram_post: 'Instagram post',
    instagram_reel: 'Instagram reel',
  }[linkType] || 'post';

  const prompt = `You are a social media content expert. Write a text similar to the original post content${postContent ? ' (provided below)' : ''} with slight modifications to support and endorse the message.

${postContent ? `Original Post Content:\n${postContent}\n\n` : ''}Link: ${link}
Type: ${linkTypeLabel}
${description ? `Description: ${description}` : ''}

Requirements:
- Write a text similar to the original post content with slight variations
- The text should support and endorse the original message
- Keep the same tone and style as the original
${getLengthRequirement(linkType)}
${getUsageRequirement(linkType)}
- Do NOT include the tweet link in the text
- Use these hashtags: #KingRezaPahlavi #IranMassacre #DigitalBlackoutIran
- Output must be in English only
${postContent ? '- Base your text on the original post content provided above, but rewrite it with slight changes to show support' : ''}

Return only the rewritten text, without any additional explanations.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      console.error('No text generated from Gemini');
      return null;
    }
    return generatedText.trim();
  } catch (error) {
    console.error('Gemini API request failed:', error);
    return null;
  }
}

async function generateWithGroq(link, linkType, description, postContent = null) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('GROQ_API_KEY not set, skipping AI template generation');
    return null;
  }

  const linkTypeLabel = {
    twitter_post: 'Twitter post',
    instagram_post: 'Instagram post',
    instagram_reel: 'Instagram reel',
  }[linkType] || 'post';

  const prompt = `You are a social media content expert. Write a text similar to the original post content${postContent ? ' (provided below)' : ''} with slight modifications to support and endorse the message.

${postContent ? `Original Post Content:\n${postContent}\n\n` : ''}Link: ${link}
Type: ${linkTypeLabel}
${description ? `Description: ${description}` : ''}

Requirements:
- Write a text similar to the original post content with slight variations
- The text should support and endorse the original message
- Keep the same tone and style as the original
${getLengthRequirement(linkType)}
${getUsageRequirement(linkType)}
- Do NOT include the tweet link in the text
- Use these hashtags: #KingRezaPahlavi #IranMassacre #DigitalBlackoutIran
- Output must be in English only
${postContent ? '- Base your text on the original post content provided above, but rewrite it with slight changes to show support' : ''}

Return only the rewritten text, without any additional explanations.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;
    if (!generatedText) {
      console.error('No text generated from Groq');
      return null;
    }
    return generatedText.trim();
  } catch (error) {
    console.error('Groq API request failed:', error);
    return null;
  }
}

async function generateWithOpenAI(link, linkType, description, postContent = null) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set, skipping AI template generation');
    return null;
  }

  const linkTypeLabel = {
    twitter_post: 'Twitter post',
    instagram_post: 'Instagram post',
    instagram_reel: 'Instagram reel',
  }[linkType] || 'post';

  const prompt = `You are a social media content expert. Write a text similar to the original post content${postContent ? ' (provided below)' : ''} with slight modifications to support and endorse the message.

${postContent ? `Original Post Content:\n${postContent}\n\n` : ''}Link: ${link}
Type: ${linkTypeLabel}
${description ? `Description: ${description}` : ''}

Requirements:
- Write a text similar to the original post content with slight variations
- The text should support and endorse the original message
- Keep the same tone and style as the original
${getLengthRequirement(linkType)}
${getUsageRequirement(linkType)}
- Do NOT include the tweet link in the text
- Use these hashtags: #KingRezaPahlavi #IranMassacre #DigitalBlackoutIran
- Output must be in English only
${postContent ? '- Base your text on the original post content provided above, but rewrite it with slight changes to show support' : ''}

Return only the rewritten text, without any additional explanations.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;
    if (!generatedText) {
      console.error('No text generated from OpenAI');
      return null;
    }
    return generatedText.trim();
  } catch (error) {
    console.error('OpenAI API request failed:', error);
    return null;
  }
}

// ----- Provider-specific helpers for 2 / 4 templates (parallel) -----

async function generateTwoWithGroq(link, linkType, description, postContent = null) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('GROQ_API_KEY not set, skipping AI template generation');
    return null;
  }

  const linkTypeLabel = {
    twitter_post: 'Twitter post',
    instagram_post: 'Instagram post',
    instagram_reel: 'Instagram reel',
  }[linkType] || 'post';

  const basePrompt = `You are a social media content expert. Write a text similar to the original post content${postContent ? ' (provided below)' : ''} with slight modifications to support and endorse the message.

${postContent ? `Original Post Content:\n${postContent}\n\n` : ''}Link: ${link}
Type: ${linkTypeLabel}
${description ? `Description: ${description}` : ''}

Requirements:
- Write a text similar to the original post content with slight variations
- The text should support and endorse the original message
- Keep the same tone and style as the original
${getLengthRequirement(linkType)}
${getUsageRequirement(linkType)}
- Do NOT include the tweet link in the text
- Use these hashtags: #KingRezaPahlavi #IranMassacre #DigitalBlackoutIran
- Output must be in English only
${postContent ? '- Base your text on the original post content provided above, but rewrite it with slight changes to show support' : ''}

Return only the rewritten text, without any additional explanations.`;

  const prompts = [
    `${basePrompt}\n\nPlease rewrite with a serious and professional tone while maintaining similarity to the original.`,
    `${basePrompt}\n\nPlease rewrite with an engaging and inspiring tone while maintaining similarity to the original.`,
  ];

  try {
    const requests = prompts.map((prompt, index) =>
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: index === 0 ? 0.7 : 0.9,
          max_tokens: 500,
        }),
      })
    );

    const responses = await Promise.all(requests);
    const templates = [];
    for (const response of responses) {
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', response.status, errorText);
        continue;
      }
      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content;
      if (generatedText) templates.push(generatedText.trim());
    }
    return templates.length > 0 ? templates : null;
  } catch (error) {
    console.error('Groq API request failed:', error);
    return null;
  }
}

async function generateFourWithGroq(link, linkType, description, postContent = null) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('GROQ_API_KEY not set, skipping AI template generation');
    return null;
  }

  const linkTypeLabel = {
    twitter_post: 'Twitter post',
    instagram_post: 'Instagram post',
    instagram_reel: 'Instagram reel',
  }[linkType] || 'post';

  const basePrompt = `You are a social media content expert. Write a text similar to the original post content${postContent ? ' (provided below)' : ''} with slight modifications to support and endorse the message.

${postContent ? `Original Post Content:\n${postContent}\n\n` : ''}Link: ${link}
Type: ${linkTypeLabel}
${description ? `Description: ${description}` : ''}

Requirements:
- Write a text similar to the original post content with slight variations
- The text should support and endorse the original message
- Keep the same tone and style as the original
${getLengthRequirement(linkType)}
${getUsageRequirement(linkType)}
- Do NOT include the tweet link in the text
- Use these hashtags: #KingRezaPahlavi #IranMassacre #DigitalBlackoutIran
- Output must be in English only
${postContent ? '- Base your text on the original post content provided above, but rewrite it with slight changes to show support' : ''}

Return only the rewritten text, without any additional explanations.`;

  const prompts = [
    `${basePrompt}\n\nPlease rewrite with a serious and professional tone while maintaining similarity to the original.`,
    `${basePrompt}\n\nPlease rewrite with an engaging and inspiring tone while maintaining similarity to the original.`,
    `${basePrompt}\n\nPlease rewrite with an urgent and action-oriented tone while maintaining similarity to the original.`,
    `${basePrompt}\n\nPlease rewrite with a supportive and empathetic tone while maintaining similarity to the original.`,
  ];

  try {
    const requests = prompts.map((prompt, index) =>
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: [0.7, 0.9, 0.8, 0.85][index],
          max_tokens: 500,
        }),
      })
    );

    const responses = await Promise.all(requests);
    const templates = [];
    for (const response of responses) {
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', response.status, errorText);
        continue;
      }
      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content;
      if (generatedText) templates.push(generatedText.trim());
    }
    return templates.length > 0 ? templates : null;
  } catch (error) {
    console.error('Groq API request failed:', error);
    return null;
  }
}

async function generateFourWithGemini(link, linkType, description, postContent = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, skipping AI template generation');
    return null;
  }

  const linkTypeLabel = {
    twitter_post: 'Twitter post',
    instagram_post: 'Instagram post',
    instagram_reel: 'Instagram reel',
  }[linkType] || 'post';

  const basePrompt = `You are a social media content expert. Write a text similar to the original post content${postContent ? ' (provided below)' : ''} with slight modifications to support and endorse the message.

${postContent ? `Original Post Content:\n${postContent}\n\n` : ''}Link: ${link}
Type: ${linkTypeLabel}
${description ? `Description: ${description}` : ''}

Requirements:
- Write a text similar to the original post content with slight variations
- The text should support and endorse the original message
- Keep the same tone and style as the original
${getLengthRequirement(linkType)}
${getUsageRequirement(linkType)}
- Do NOT include the tweet link in the text
- Use these hashtags: #KingRezaPahlavi #IranMassacre #DigitalBlackoutIran
- Output must be in English only
${postContent ? '- Base your text on the original post content provided above, but rewrite it with slight changes to show support' : ''}

Return only the rewritten text, without any additional explanations.`;

  const prompts = [
    `${basePrompt}\n\nPlease rewrite with a serious and professional tone while maintaining similarity to the original.`,
    `${basePrompt}\n\nPlease rewrite with an engaging and inspiring tone while maintaining similarity to the original.`,
    `${basePrompt}\n\nPlease rewrite with an urgent and action-oriented tone while maintaining similarity to the original.`,
    `${basePrompt}\n\nPlease rewrite with a supportive and empathetic tone while maintaining similarity to the original.`,
  ];

  try {
    const requests = prompts.map((prompt, index) =>
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 500,
            },
          }),
        }
      )
    );

    const responses = await Promise.all(requests);
    const templates = [];
    for (const response of responses) {
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        continue;
      }
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) templates.push(generatedText.trim());
    }
    return templates.length > 0 ? templates : null;
  } catch (error) {
    console.error('Gemini API request failed:', error);
    return null;
  }
}

async function generateTwoWithGemini(link, linkType, description, postContent = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, skipping AI template generation');
    return null;
  }

  const linkTypeLabel = {
    twitter_post: 'Twitter post',
    instagram_post: 'Instagram post',
    instagram_reel: 'Instagram reel',
  }[linkType] || 'post';

  const basePrompt = `You are a social media content expert. Write a text similar to the original post content${postContent ? ' (provided below)' : ''} with slight modifications to support and endorse the message.

${postContent ? `Original Post Content:\n${postContent}\n\n` : ''}Link: ${link}
Type: ${linkTypeLabel}
${description ? `Description: ${description}` : ''}

Requirements:
- Write a text similar to the original post content with slight variations
- The text should support and endorse the original message
- Keep the same tone and style as the original
${getLengthRequirement(linkType)}
${getUsageRequirement(linkType)}
- Do NOT include the tweet link in the text
- Use these hashtags: #KingRezaPahlavi #IranMassacre #DigitalBlackoutIran
- Output must be in English only
${postContent ? '- Base your text on the original post content provided above, but rewrite it with slight changes to show support' : ''}

Return only the rewritten text, without any additional explanations.`;

  const prompts = [
    `${basePrompt}\n\nPlease rewrite with a serious and professional tone while maintaining similarity to the original.`,
    `${basePrompt}\n\nPlease rewrite with an engaging and inspiring tone while maintaining similarity to the original.`,
  ];

  try {
    const requests = prompts.map((prompt) =>
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 500,
            },
          }),
        }
      )
    );

    const responses = await Promise.all(requests);
    const templates = [];
    for (const response of responses) {
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        continue;
      }
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) templates.push(generatedText.trim());
    }
    return templates.length > 0 ? templates : null;
  } catch (error) {
    console.error('Gemini API request failed:', error);
    return null;
  }
}

async function generateTwoWithOpenAI(link, linkType, description, postContent = null) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set, skipping AI template generation');
    return null;
  }

  const linkTypeLabel = {
    twitter_post: 'Twitter post',
    instagram_post: 'Instagram post',
    instagram_reel: 'Instagram reel',
  }[linkType] || 'post';

  const basePrompt = `You are a social media content expert. Write a text similar to the original post content${postContent ? ' (provided below)' : ''} with slight modifications to support and endorse the message.

${postContent ? `Original Post Content:\n${postContent}\n\n` : ''}Link: ${link}
Type: ${linkTypeLabel}
${description ? `Description: ${description}` : ''}

Requirements:
- Write a text similar to the original post content with slight variations
- The text should support and endorse the original message
- Keep the same tone and style as the original
${getLengthRequirement(linkType)}
${getUsageRequirement(linkType)}
- Do NOT include the tweet link in the text
- Use these hashtags: #KingRezaPahlavi #IranMassacre #DigitalBlackoutIran
- Output must be in English only
${postContent ? '- Base your text on the original post content provided above, but rewrite it with slight changes to show support' : ''}

Return only the rewritten text, without any additional explanations.`;

  const prompts = [
    `${basePrompt}\n\nPlease rewrite with a serious and professional tone while maintaining similarity to the original.`,
    `${basePrompt}\n\nPlease rewrite with an engaging and inspiring tone while maintaining similarity to the original.`,
  ];

  try {
    const requests = prompts.map((prompt, index) =>
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: index === 0 ? 0.7 : 0.9,
          max_tokens: 500,
        }),
      })
    );

    const responses = await Promise.all(requests);
    const templates = [];
    for (const response of responses) {
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        continue;
      }
      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content;
      if (generatedText) templates.push(generatedText.trim());
    }
    return templates.length > 0 ? templates : null;
  } catch (error) {
    console.error('OpenAI API request failed:', error);
    return null;
  }
}

