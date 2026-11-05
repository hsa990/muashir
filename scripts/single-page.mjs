// Folds a build into one HTML file for hosts that take a single page.
// Usage: node scripts/single-page.mjs <build folder> <output file>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [folder, output] = process.argv.slice(2)
const html = readFileSync(join(folder, 'index.html'), 'utf8')
const asset = (pattern) => readFileSync(join(folder, html.match(pattern)[1].replace(/^\.?\//, '')), 'utf8')

const firstPaint = html.match(/<script>[\s\S]*?<\/script>/)[0]
const description = html.match(/<meta name="description"[^>]*>/)[0]
const title = html.match(/<title>.*?<\/title>/)[0]
const css = asset(/<link rel="stylesheet"[^>]*href="([^"]+)"/)
const js = asset(/<script type="module"[^>]*src="([^"]+)"/).replace(/<\/script/gi, '<\\/script')

writeFileSync(
  output,
  `${title}\n${description}\n${firstPaint}\n<style>${css}</style>\n<div id="root"></div>\n<script type="module">${js}</script>\n`,
)
console.log(`${output}: ${(Buffer.byteLength(readFileSync(output)) / 1048576).toFixed(2)} MB`)
