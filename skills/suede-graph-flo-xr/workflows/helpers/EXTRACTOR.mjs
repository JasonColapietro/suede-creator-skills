// Extract the inline `node -e` scripts from the public suede-graph-flo-xr workflow
// into standalone .cjs helper files, preserving the public copy's hardening.
// The template literals must be EVALUATED, not copied as source: `\\n` in the
// source is a single backslash-n in the resulting string.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs'

const [, , workflowPath, helperDir] = process.argv
const source = readFileSync(workflowPath, 'utf8')
const lines = source.split('\n')

const TARGETS = [
  {constName: 'scoutSetupScript', file: 'scout-setup.cjs'},
  {constName: 'candidatePathAuditScript', file: 'candidate-audit.cjs'},
  {constName: 'script', file: 'apply-patch.cjs'},
  {constName: 'diffDigestScript', file: 'diff-digest.cjs'},
  {constName: 'gateSandboxScript', file: 'gate-sandbox.cjs'},
]

// scoutSetupScript interpolates ${parsePorcelainZ.toString()}; recover that source.
const parseLineIndex = lines.findIndex(line => /^const parsePorcelainZ\s*=/.test(line))
if (parseLineIndex === -1) throw new Error('parsePorcelainZ definition not found')
// Multi-line arrow function: consume lines until braces balance back to zero.
let depth = 0
let parseEnd = -1
for (let i = parseLineIndex; i < lines.length; i += 1) {
  for (const ch of lines[i]) {
    if (ch === '{') depth += 1
    else if (ch === '}') depth -= 1
  }
  if (depth === 0 && i > parseLineIndex) { parseEnd = i; break }
}
if (parseEnd === -1) throw new Error('parsePorcelainZ definition never closed')
const parseSource = lines
  .slice(parseLineIndex, parseEnd + 1)
  .join('\n')
  .replace(/^const parsePorcelainZ\s*=\s*/, '')
  .trim()
const parsePorcelainZ = new Function(`return (${parseSource})`)()

const HEADER = `// Auto-extracted from suede-graph-flo-xr.js inline node -e scripts. The splice keeps the
// original -e argv convention: process.argv[1] is the first user argument.
process.argv.splice(1,1);
`

mkdirSync(helperDir, {recursive: true})
const results = []
for (const {constName, file} of TARGETS) {
  const index = lines.findIndex(line => new RegExp(`^\\s*const ${constName}\\s*=\\s*\``).test(line))
  if (index === -1) throw new Error(`constant not found: ${constName}`)
  const raw = lines[index]
  const start = raw.indexOf('`')
  const end = raw.lastIndexOf('`')
  if (start === -1 || end <= start) throw new Error(`template literal not delimited on one line: ${constName}`)
  const literal = raw.slice(start, end + 1)
  const body = new Function('parsePorcelainZ', `return ${literal}`)(parsePorcelainZ)
  writeFileSync(`${helperDir}/${file}`, HEADER + body + '\n')
  results.push({file, constName, line: index + 1, bytes: body.length})
}
process.stdout.write(JSON.stringify(results, null, 2) + '\n')
