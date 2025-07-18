// File: src/analyzers/aiAnalyzer.js
import axios from 'axios';

/** Extract JSON array text from AI response. */
function extractJSON(text) {
  const fence = text.match(/```json([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  const arr = text.match(/\[([\s\S]*?)\]/);
  if (arr) return '[' + arr[1] + ']';
  return text;
}

export async function analyzeCodeSnippet(code, openaiKey) {
  const systemPrompt = `You are an expert code reviewer. Analyze this code snippet and return ONLY a JSON array of objects [{"line":<number>,"message":"..."}].`;
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: code }
      ],
      max_tokens: 500
    },
    { headers: { Authorization: `Bearer ${openaiKey}` } }
  );

  const raw = data.choices?.[0]?.message?.content || '';
  const jsonText = extractJSON(raw);
  try {
    return JSON.parse(jsonText).map(c => ({
      line:   typeof c.line === 'number' ? c.line : null,
      message: c.message || ''
    }));
  } catch {
    console.error('Failed to parse code snippet JSON:', raw);
    throw new Error('Invalid AI response format');
  }
}

export async function analyzeOwaspSnippet(code, openaiKey) {
  const systemPrompt = `You are an OWASP Top 10 security expert. Analyze this snippet and return ONLY a JSON array [{"category":"A1-Injection","line":<number>,"message":"..."}].`;
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: code }
      ],
      max_tokens: 300,
      temperature: 0
    },
    { headers: { Authorization: `Bearer ${openaiKey}` } }
  );

  const raw = data.choices?.[0]?.message?.content || '';
  const jsonText = extractJSON(raw);
  try {
    return JSON.parse(jsonText).map(c => ({
      category: c.category,
      line:     typeof c.line === 'number' ? c.line : null,
      message:  c.message || ''
    }));
  } catch {
    console.error('Failed to parse OWASP JSON:', raw);
    throw new Error('Invalid AI response format');
  }
}
