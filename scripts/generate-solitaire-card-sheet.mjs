import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { RANKS, SUITS } from '../src/games/solitaire/model/types.ts'
import { numberedPips, suitPaths } from '../src/games/solitaire/ui/cardArtwork.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'context/M19F1_CARD_SHEET.svg')
const clamp = (min, value, max) => Math.max(min, Math.min(value, max))
const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
const rankName = { J: 'jack', Q: 'queen', K: 'king' }

const sections = [
  { title: '320px viewport · Classic · 41px cards', width: 41, large: false, highContrast: false },
  { title: '360px viewport · Classic · 47px cards', width: 47, large: false, highContrast: false },
  { title: '390px viewport · Classic · 51px cards', width: 51, large: false, highContrast: false },
  { title: '430px viewport · Classic · 57px cards', width: 57, large: false, highContrast: false },
  { title: 'Desktop · Classic · 88px cards', width: 88, large: false, highContrast: false },
  { title: '320px viewport · Large Print · 41px cards', width: 41, large: true, highContrast: false },
  { title: '320px viewport · High Contrast · 41px cards', width: 41, large: false, highContrast: true },
]

const courtDefs = await Promise.all(['J', 'Q', 'K'].flatMap((rank) => SUITS.map(async (suit) => {
  const face = await readFile(resolve(root, `public/cards/english-pattern/${rankName[rank]}_of_${suit}.svg`))
  return `<image id="court-${rank}-${suit}" width="360" height="540" href="data:image/svg+xml;base64,${face.toString('base64')}"/>`
})))

const corner = (rank, suit, width, large, colour) => {
  const font = large ? clamp(15.68, width * 0.37, 22.4) : clamp(13.12, width * 0.32, 19.52)
  const rankFont = rank === '10' ? font * (large ? 0.84 : 0.9) : font
  const symbol = font * 1.02
  const gap = font * 0.03
  const boxWidth = Math.max(symbol + 2, rank === '10' ? rankFont * 1.28 + 2 : rankFont + 2)
  const boxHeight = rankFont + symbol + gap + 2
  const symbolY = 1 + rankFont + gap + symbol / 2
  return `<rect x="0" y="0" width="${boxWidth}" height="${boxHeight}" fill="#fff"/>`
    + `<text x="${boxWidth / 2}" y="${rankFont * 0.9 + 1}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${rankFont}" font-weight="800" letter-spacing="${rank === '10' ? '-0.08em' : '0'}" fill="${colour}">${rank}</text>`
    + `<path d="${suitPaths[suit]}" fill="${colour}" transform="translate(${boxWidth / 2} ${symbolY}) scale(${symbol / 100}) translate(-50 -50)"/>`
}

const faceSvg = (rank, suit, section) => {
  const width = section.width
  const height = width * 1.4
  const scale = (height - 2) / 540
  const xOffset = (width - 360 * scale) / 2
  const colour = suit === 'hearts' || suit === 'diamonds'
    ? section.highContrast ? '#9e101b' : '#b52d38'
    : section.highContrast ? '#111111' : '#171717'
  const art = rank in rankName
    ? `<use href="#court-${rank}-${suit}"/>`
    : numberedPips[rank].map((pip) => `<path d="${suitPaths[suit]}" fill="${colour}" transform="translate(${pip.x} ${pip.y}) rotate(${pip.inverted ? 180 : 0}) scale(${(pip.size ?? 64) / 100}) translate(-50 -50)"/>`).join('')
  const index = corner(rank, suit, width, section.large, colour)
  return `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="4" fill="#fff" stroke="${section.highContrast ? '#111' : '#bab7ae'}" stroke-width="${section.highContrast ? 2 : 1}"/>`
    + `<g transform="translate(${xOffset} 1) scale(${scale})">${art}</g>`
    + `<g transform="translate(2 2)">${index}</g>`
    + `<g transform="translate(${width - 2} ${height - 2}) rotate(180)">${index}</g>`
}

const margin = 18
const gap = 7
let y = margin
const rows = []
for (const section of sections) {
  const width = section.width
  const height = width * 1.4
  const sectionWidth = 13 * width + 12 * gap
  const sectionHeight = 32 + 4 * height + 3 * gap
  rows.push(`<rect x="${margin - 8}" y="${y - 8}" width="${sectionWidth + 16}" height="${sectionHeight + 16}" rx="10" fill="#f7f4ee"/>`)
  rows.push(`<text x="${margin}" y="${y + 13}" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="700" fill="#202820">${escapeXml(section.title)}</text>`)
  for (const [suitIndex, suit] of SUITS.entries()) {
    for (const [rankIndex, rank] of RANKS.entries()) {
      const x = margin + rankIndex * (width + gap)
      const cardY = y + 32 + suitIndex * (height + gap)
      rows.push(`<g transform="translate(${x} ${cardY})">${faceSvg(rank, suit, section)}</g>`)
    }
  }
  y += sectionHeight + 26
}
const canvasWidth = 2 * margin + 13 * 88 + 12 * gap
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvasWidth}" height="${y}" viewBox="0 0 ${canvasWidth} ${y}">`
  + `<rect width="100%" height="100%" fill="#e5e1d8"/><defs>${courtDefs.join('')}</defs>${rows.join('')}</svg>`
await writeFile(output, sheet)
process.stdout.write(`Wrote ${output}\n`)
