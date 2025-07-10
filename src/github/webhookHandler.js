// src/github/webhookHandler.js
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { handleLintAnalysis } from '../analyzers/lintAnalyzer.js'
import { handleAIAnalysis } from '../analyzers/aiAnalyzer.js'

/**
 * Procesa un evento de Pull Request desde GitHub/GitLab
 * @param {Object} payload - Cuerpo del webhook
 * @param {string} workspaceDir - Directorio base donde clonar repos
 */
export async function handleWebhook(payload, workspaceDir) {
  const repoUrl = payload.repository.clone_url
  const prNumber = payload.pull_request?.number || payload.object_attributes?.iid
  const branch = payload.pull_request?.head.ref || payload.object_attributes?.source_branch
  const clonePath = path.join(workspaceDir, `repo-pr-${prNumber}`)

  // Limpia workspace previo si existe
  if (fs.existsSync(clonePath)) {
    fs.rmSync(clonePath, { recursive: true, force: true })
  }

  // Clonar el repo y checkout al branch de la PR
  await new Promise((resolve, reject) => {
    exec(`git clone ${repoUrl} ${clonePath}`, (err) => {
      if (err) return reject(err)
      exec(`git -C ${clonePath} checkout ${branch}`, (err2) => {
        if (err2) return reject(err2)
        resolve()
      })
    })
  })

  // Ejecutar análisis de lint
  const lintComments = await handleLintAnalysis(clonePath)

  // Ejecutar análisis de IA (OpenAI)
  const aiComments = await handleAIAnalysis(clonePath, payload)

  // Combinar comentarios y retornarlos
  return [...lintComments, ...aiComments]
}
