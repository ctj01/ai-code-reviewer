// src/analyzers/aiAnalyzer.js
import { execSync } from 'child_process'
import axios from 'axios'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in environment')
}

/**
 * Analyze a git diff using OpenAI's API to provide code review suggestions.
 * @param {string} repoPath - Path to the cloned repository.
 * @param {Object} payload - GitHub/GitLab webhook payload containing pull request details.
 * @returns {Promise<Array<{path: string, line: number, message: string}>>}
 */
export async function handleAIAnalysis(repoPath, payload) {
  const baseBranch = payload.pull_request?.base.ref || payload.object_attributes?.target_branch || 'main'
  const diffCmd = `git -C ${repoPath} diff origin/${baseBranch}...HEAD`
  const diff = execSync(diffCmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })

const systemPrompt = `You are an expert code reviewer. Analyze the following git diff and provide concise suggestions focusing on:
- Readability improvements
- Design patterns and best practices
- Potential security vulnerabilities
- Style and conventions

Return a JSON array of objects with: path (relative file path), line (line number in the diff hunk), message (suggestion).`

  const userPrompt = diff

  // Llamar a la API de OpenAI
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1000
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      }
    }
  )

  // Parsear la respuesta
  let comments = []
  try {
    const text = response.data.choices[0].message.content
    comments = JSON.parse(text)
  } catch (err) {
    console.error('Error parsing AI response:', err)
    return []
  }

  return comments.map(c => ({
    path: path.relative(repoPath, path.join(repoPath, c.path)),
    line: c.line,
    message: c.message
  }))
}
