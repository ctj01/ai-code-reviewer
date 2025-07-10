import bodyParser from 'body-parser'
import os from 'os'
import path from 'path'
import dotenv from 'dotenv'
import axios from 'axios'
import { execSync } from 'child_process'
import { parsePatch } from 'diff'
import { handleWebhook } from './github/webhookHandler.js'
import express from 'express'

dotenv.config()

const app = express()
app.use(bodyParser.json())

app.get('/', (_req, res) => {
res.send('AI Code Reviewer is up!')
})

app.post('/webhook', async (req, res) => {
try {
const event = req.headers['x-github-event']
if (event !== 'pull_request') return res.status(200).send('Ignored event')

const payload = req.body
const owner = payload.repository.owner.login
const repo = payload.repository.name
const prNumber = payload.pull_request.number
const headSha = payload.pull_request.head.sha
const base = payload.pull_request.base.ref

const workspace = os.tmpdir()
const clonePath = path.join(workspace, `repo-pr-${prNumber}`)
const comments = await handleWebhook(payload, workspace)
if (!comments.length) return res.status(200).send('No comments')

execSync(`git -C ${clonePath} fetch origin ${base}`, { stdio: 'ignore' })

let inlinePosted = false
for (const c of comments) {
  const pathNormalized = c.path.replace(/\\/g, '/')
  let patchText
  try {
    patchText = execSync(
      `git -C ${clonePath} diff origin/${base}...HEAD -- ${pathNormalized}`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    )
  } catch {
    continue
  }
  const files = parsePatch(patchText)
  const file = files.find(f => {
    const normalized = f.newFileName.replace(/^b\//, '').replace(/\\/g, '/')
    return normalized === pathNormalized || normalized.endsWith(pathNormalized)
  })
  if (!file) continue

  let position = 0, found = false
  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      position++
      if (line.newNumber === c.line) { found = true; break }
    }
    if (found) break
  }
  if (!found) continue

  await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/comments`,
    { body: c.message, commit_id: headSha, path: pathNormalized, position, side: 'RIGHT' },
    { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
  )
  inlinePosted = true
}

if (!inlinePosted) {
  const summary = comments
    .map(c => `- **${c.path.replace(/\\/g,'/')}** (línea ${c.line}): ${c.message}`)
    .join('\n')
  await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    { body: summary },
    { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
  )
}

res.status(200).send('Comments posted')
} catch (err) {
console.error('Error handling webhook:', err)
res.status(500).send('Server error')
}
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))