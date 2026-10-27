const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const sharp = require(process.env.ZENPLAY_SHARP_PATH || 'sharp')

const root = path.resolve(__dirname, '..')
const html = fs.readFileSync(path.join(__dirname, 'M19G1_MOBILE_CARD_PROTOTYPE.html'), 'utf8')
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
const { suits, cards, courtNames } = vm.runInNewContext(
  `${script}\n({ suits, cards, courtNames })`,
  { document: { getElementById: () => ({ innerHTML: '' }) } },
)
const assets = new Map()

const pip = (suit, x, y, size) => `<path d="${suits[suit]}" transform="translate(${x} ${y}) scale(${size / 100})" fill="currentColor"/>`

function corner(rank, suit, width, height, proposed, bottom = false) {
  const font = proposed ? Math.max(16, Math.min(width * .42, 23)) : Math.max(16, Math.min(width * .38, 23.2))
  const rankFont = rank === '10' ? font * (proposed ? .82 : .9) : font
  const suitSize = font * (proposed ? .68 : 1.02)
  const blockWidth = Math.min(width - 2, Math.max(rank === '10' ? rankFont * 1.3 : font * .95, suitSize) + 3)
  const content = `<rect width="${blockWidth}" height="${font + suitSize + 4}" fill="white"/>
    <text x="${rank === '10' ? 1.5 : blockWidth / 2}" y="${rankFont * .91 + 1}" font-family="Arial" font-size="${rankFont}" font-weight="900" text-anchor="${rank === '10' ? 'start' : 'middle'}" fill="currentColor">${rank}</text>
    ${pip(suit, (blockWidth - suitSize) / 2, font + 2, suitSize)}`
  return bottom
    ? `<g transform="translate(${width} ${height}) rotate(180) translate(-2 -2)">${content}</g>`
    : `<g transform="translate(2 2)">${content}</g>`
}

function card(rank, suit, mode, width, height, x, y, id) {
  const isCourt = Boolean(courtNames[rank])
  let art
  if (isCourt) {
    const png = assets.get(`${rank}_${suit}`)
    const image = `<image href="data:image/png;base64,${png}" x="0" y="0" width="360" height="540"/>`
    if (mode === 'portrait' || mode === 'tight') {
      const close = mode === 'tight'
      const left = width * (close ? .26 : .21)
      const top = height * (close ? .28 : .30)
      const windowWidth = width * (close ? .72 : .77)
      const windowHeight = height * (close ? .68 : .67)
      const viewBox = close ? '115 45 190 220' : '85 30 245 280'
      art = `<svg x="${left}" y="${top}" width="${windowWidth}" height="${windowHeight}" viewBox="${viewBox}">${image}</svg>`
    } else {
      const artWidth = height * 2 / 3
      art = `<image href="data:image/png;base64,${png}" x="${(width - artWidth) / 2}" y="0" width="${artWidth}" height="${height}"/>`
      if (mode === 'full') art += `<rect x="${width * .72}" y="${height * .71}" width="${width * .28}" height="${height * .29}" fill="white"/>`
    }
  } else if (mode === 'old') {
    const size = 200 * height / 540
    art = pip(suit, (width - size) / 2, (height - size) / 2, size)
  } else {
    const size = width * .7
    art = pip(suit, width - size - 2, height - size - 2, size)
  }
  const ink = suit === 'hearts' || suit === 'diamonds' ? '#bd2029' : '#171717'
  return `<g transform="translate(${x} ${y})" style="color:${ink}">
    <clipPath id="clip-${id}"><rect width="${width}" height="${height}" rx="4"/></clipPath>
    <rect width="${width}" height="${height}" rx="4" fill="white"/>
    <g clip-path="url(#clip-${id})">${art}${corner(rank, suit, width, height, mode !== 'old')}${mode === 'old' ? corner(rank, suit, width, height, false, true) : ''}</g>
    <rect width="${width}" height="${height}" rx="4" fill="none" stroke="#bab7ae" stroke-width="1"/>
  </g>`
}

async function main() {
  for (const [rank, suit] of cards.filter(([rank]) => courtNames[rank])) {
    const source = path.join(root, 'public', 'cards', 'english-pattern', `${courtNames[rank]}_of_${suit}.svg`)
    assets.set(`${rank}_${suit}`, (await sharp(source, { density: 192 }).png().toBuffer()).toString('base64'))
  }
  for (const viewport of [320, 390]) {
    const width = (viewport - 2 - 12 - 6 * 3.2) / 7
    const height = width * 1.4
    const row = height + 12
    const courtStart = 70 + 4 * row + 28
    const stackStart = courtStart + 3 * row + 24
    const step = Math.max(32, width * .76)
    const canvasHeight = Math.ceil(stackStart + height + 3 * step + 45)
    const parts = [
      `<rect width="${viewport}" height="${canvasHeight}" fill="#19633f"/>`,
      `<rect width="${viewport}" height="64" fill="#f7faf7"/>`,
      `<text x="12" y="25" font-family="Arial" font-size="17" font-weight="bold" fill="#17251f">${viewport}px viewport</text>`,
      `<text x="12" y="44" font-family="Arial" font-size="11" fill="#40554a">${width.toFixed(1)} × ${height.toFixed(1)}px cards</text>`,
      `<text x="70" y="68" fill="white" font-family="Arial" font-size="10">M19G</text>`,
      `<text x="167" y="68" fill="white" font-family="Arial" font-size="10">One-index proposal</text>`,
    ]
    let id = 0
    cards.filter(([rank]) => !courtNames[rank]).forEach(([rank, suit, symbol], i) => {
      const y = 70 + i * row
      parts.push(`<line x1="6" x2="${viewport - 6}" y1="${y}" y2="${y}" stroke="#ffffff33"/>`)
      parts.push(`<text x="12" y="${y + height / 2 + 4}" fill="white" font-family="Arial" font-size="12" font-weight="bold">${rank}${symbol}</text>`)
      parts.push(card(rank, suit, 'old', width, height, 95, y + 6, id++))
      parts.push(card(rank, suit, 'new', width, height, 196, y + 6, id++))
    })
    for (const [j, label] of ['M19G', 'A full', 'B portrait', 'C tight'].entries()) {
      parts.push(`<text x="${[45, 110, 176, 242][j]}" y="${courtStart - 8}" fill="white" font-family="Arial" font-size="9">${label}</text>`)
    }
    cards.filter(([rank]) => courtNames[rank]).forEach(([rank, suit, symbol], i) => {
      const y = courtStart + i * row
      parts.push(`<line x1="6" x2="${viewport - 6}" y1="${y}" y2="${y}" stroke="#ffffff33"/>`)
      parts.push(`<text x="7" y="${y + height / 2 + 4}" fill="white" font-family="Arial" font-size="12" font-weight="bold">${rank}${symbol}</text>`)
      for (const [j, mode] of ['old', 'full', 'portrait', 'tight'].entries()) {
        parts.push(card(rank, suit, mode, width, height, [44, 110, 176, 242][j], y + 6, id++))
      }
    })
    parts.push(`<text x="12" y="${stackStart - 8}" fill="white" font-family="Arial" font-size="11" font-weight="bold">Tableau overlap · ${step.toFixed(1)}px exposed step</text>`)
    for (const [j, mode] of ['old', 'new'].entries()) {
      for (const [i, [rank, suit]] of [['K', 'diamonds'], ['Q', 'hearts'], ['J', 'spades'], ['10', 'spades']].entries()) {
        parts.push(card(rank, suit, mode, width, height, 95 + j * 101, stackStart + i * step, id++))
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewport}" height="${canvasHeight}">${parts.join('')}</svg>`
    const output = path.join(__dirname, `M19G1_MOBILE_CARD_PROTOTYPE_${viewport}.png`)
    await sharp(Buffer.from(svg)).png().toFile(output)
    console.log(`${viewport}px: ${width.toFixed(1)} × ${height.toFixed(1)}px cards; ${output}`)
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
