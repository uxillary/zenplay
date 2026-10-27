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
  const rankFont = rank === '10' && !proposed ? font * .9 : font
  const suitSize = font * (proposed ? .7 : 1.02)
  const blockWidth = Math.min(width - 2, Math.max(rank === '10' ? rankFont * 1.3 : font * .95, suitSize) + 3)
  const hasBacking = !proposed || ['J', 'Q', 'K'].includes(rank)
  const content = `${hasBacking ? `<rect width="${blockWidth}" height="${font + suitSize + (proposed ? 5 : 4)}" rx="${proposed ? 2 : 0}" fill="white"/>` : ''}
    <text x="${rank === '10' ? 1.5 : blockWidth / 2}" y="${rankFont * .91 + 1}" font-family="Arial" font-size="${rankFont}" font-weight="900" letter-spacing="${rank === '10' && proposed ? '-.12em' : 'normal'}" text-anchor="${rank === '10' ? 'start' : 'middle'}" fill="currentColor">${rank}</text>
    ${pip(suit, (blockWidth - suitSize) / 2, font + (proposed ? 3 : 2), suitSize)}`
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
    if (mode !== 'old') {
      art = `<svg x="${width * .24}" y="${height * .32}" width="${width * .74}" height="${height * .65}" viewBox="85 30 245 280">${image}</svg>`
    } else {
      const artWidth = height * 2 / 3
      art = `<image href="data:image/png;base64,${png}" x="${(width - artWidth) / 2}" y="0" width="${artWidth}" height="${height}"/>`
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
    const stackStart = 70 + 7 * row + 24
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
    cards.forEach(([rank, suit, symbol], i) => {
      const y = 70 + i * row
      parts.push(`<line x1="6" x2="${viewport - 6}" y1="${y}" y2="${y}" stroke="#ffffff33"/>`)
      parts.push(`<text x="12" y="${y + height / 2 + 4}" fill="white" font-family="Arial" font-size="12" font-weight="bold">${rank}${symbol}</text>`)
      parts.push(card(rank, suit, 'old', width, height, 95, y + 6, id++))
      parts.push(card(rank, suit, 'new', width, height, 196, y + 6, id++))
    })
    parts.push(`<text x="12" y="${stackStart - 8}" fill="white" font-family="Arial" font-size="11" font-weight="bold">Tableau overlap · ${step.toFixed(1)}px exposed step</text>`)
    for (const [j, mode] of ['old', 'new'].entries()) {
      for (const [i, [rank, suit]] of [['K', 'diamonds'], ['Q', 'hearts'], ['J', 'spades'], ['10', 'spades']].entries()) {
        parts.push(card(rank, suit, mode, width, height, 95 + j * 101, stackStart + i * step, id++))
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewport}" height="${canvasHeight}">${parts.join('')}</svg>`
    const output = path.join(__dirname, `M19G1_MOBILE_CARD_PROTOTYPE_FINAL_REVIEW_${viewport}.png`)
    await sharp(Buffer.from(svg)).png().toFile(output)
    console.log(`${viewport}px: ${width.toFixed(1)} × ${height.toFixed(1)}px cards; ${output}`)
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
