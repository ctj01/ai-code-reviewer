#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import dotenv from 'dotenv'
import { handleWebhook } from './github/webhookHandler.js'

dotenv.config()

const argv = yargs(process.argv.slice(2))
  .option('payload', {
    alias: 'p',
    describe: 'Path to the GitHub webhook payload JSON',
    type: 'string',
    demandOption: true
  })
  .option('repo', {
    alias: 'r',
    describe: 'Local path to the cloned repository',
    type: 'string',
    demandOption: true
  })
  .argv

async function main() {
  const payload = JSON.parse(fs.readFileSync(argv.payload, 'utf8'))
  const comments = await handleWebhook(payload, argv.repo)
    if (!comments.length) {
        console.log('No comments generated')
        return
    }
  fs.writeFileSync('review-report.json', JSON.stringify(comments, null, 2))
  console.log(`✅ Generated review-report.json with ${comments.length} comments`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
