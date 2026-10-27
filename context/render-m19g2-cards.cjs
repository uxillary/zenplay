const fs = require('node:fs')
const path = require('node:path')
const sharp = require(process.env.ZENPLAY_SHARP_PATH || 'sharp')
const root = path.resolve(__dirname, '..')
const names = { J: 'jack', Q: 'queen', K: 'king' }
const suits = ['spades', 'hearts', 'diamonds', 'clubs']
const marks = Object.fromEntries([...fs.readFileSync(path.join(root, 'src/games/solitaire/ui/cardArtwork.ts'), 'utf8').matchAll(/^  (hearts|diamonds|clubs|spades): '([^']+)'/gm)].map(([, suit, d]) => [suit, d]))
const maskRight = { spades: 128, hearts: 112, diamonds: 122, clubs: 118 }
const mark = (suit, x, y, size) => `<path d="${marks[suit]}" transform="translate(${x} ${y}) scale(${size / 100})" fill="currentColor"/>`

function card(rank, suit, after, w, h, x, y, id, assets) {
  const font = Math.max(16, Math.min(w * .42, 23))
  const size = font * (after ? .86 : .7)
  const cw = Math.max(rank === '10' ? font * 1.3 : font * .95, size) + 3
  const court = Boolean(names[rank])
  const ink = ['hearts', 'diamonds'].includes(suit) ? '#bd2029' : '#171717'
  const art = court ? `<svg x="${w*.24}" y="${h*.32}" width="${w*.74}" height="${h*.65}" viewBox="${after ? '70 0 280 345' : '85 30 245 280'}"><image href="data:image/png;base64,${assets.get(rank+suit)}" width="360" height="540"/>${after ? `<path d="M70 0H${maskRight[suit]}V145H70Z" fill="white"/>` : ''}</svg>` : mark(suit, w-w*.7-2, h-w*.7-2, w*.7)
  return `<g transform="translate(${x} ${y})" style="color:${ink}"><clipPath id="c${id}"><rect width="${w}" height="${h}" rx="4"/></clipPath><rect width="${w}" height="${h}" rx="4" fill="white"/><g clip-path="url(#c${id})">${art}<g transform="translate(2 2)">${court ? `<rect width="${cw}" height="${font+size+5}" rx="2" fill="white"/>` : ''}<text x="${rank==='10'?1.5:cw/2}" y="${font*.91+1}" font-family="Arial" font-size="${font}" font-weight="900" letter-spacing="${rank==='10'?'-.12em':'normal'}" text-anchor="${rank==='10'?'start':'middle'}" fill="currentColor">${rank}</text>${mark(suit,(cw-size)/2,font+3,size)}</g></g><rect width="${w}" height="${h}" rx="4" fill="none" stroke="#bab7ae" stroke-width="1"/></g>`
}

async function main() {
  const assets = new Map()
  for (const [rank, name] of Object.entries(names)) for (const suit of suits) {
    const file = path.join(root, 'public/cards/english-pattern', `${name}_of_${suit}.svg`)
    assets.set(rank+suit, (await sharp(file, { density: 192 }).png().toBuffer()).toString('base64'))
  }
  for (const viewport of [320, 390]) {
    const w = (viewport-2-12-6*3.2)/7, h = w*1.4, row = h+12
    const rows = [['10','spades'],['7','hearts'],...Object.keys(names).flatMap(rank => suits.map(suit => [rank,suit]))]
    const stackY = 70+rows.length*row+25, step = Math.max(37.6,w*.86)
    const total = Math.ceil(stackY+h+3*step+20)
    const parts = [`<rect width="${viewport}" height="${total}" fill="#19633f"/><rect width="${viewport}" height="64" fill="#f7faf7"/><text x="12" y="23" font-family="Arial" font-size="16" font-weight="bold">M19G.2 · ${viewport}px</text><text x="12" y="43" font-family="Arial" font-size="11">${w.toFixed(1)} × ${h.toFixed(1)}px cards · before / after</text><text x="95" y="67" fill="white" font-family="Arial" font-size="10">Before</text><text x="196" y="67" fill="white" font-family="Arial" font-size="10">After</text>`]
    let id = 0
    rows.forEach(([rank,suit],i) => { const y=70+i*row; parts.push(`<text x="12" y="${y+h/2}" fill="white" font-family="Arial" font-size="12">${rank}${{spades:'♠',hearts:'♥',diamonds:'♦',clubs:'♣'}[suit]}</text>`,card(rank,suit,false,w,h,95,y,id++,assets),card(rank,suit,true,w,h,196,y,id++,assets)) })
    parts.push(`<text x="12" y="${stackY-7}" fill="white" font-family="Arial" font-size="11">Overlapping tableau</text>`)
    for (const [j,after] of [false,true].entries()) for (const [i,[rank,suit]] of [['K','diamonds'],['Q','diamonds'],['J','spades'],['10','spades']].entries()) parts.push(card(rank,suit,after,w,h,95+j*101,stackY+i*step,id++,assets))
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewport}" height="${total}">${parts.join('')}</svg>`
    const output = path.join(__dirname,`M19G2_CARD_COMPARISON_${viewport}.png`)
    await sharp(Buffer.from(svg)).png().toFile(output)
    console.log(`${viewport}px: ${w.toFixed(1)} × ${h.toFixed(1)}px cards; ${output}`)
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
