import { writeFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true }, appType: 'custom' })
try {
  const { CardView } = await vite.ssrLoadModule('/src/games/solitaire/ui/CardView.tsx')
  const cards = [['7', 'spades'], ['10', 'hearts'], ['4', 'clubs'], ['A', 'diamonds']]
  const renderCard = (rank, suit, cardFaces) => renderToStaticMarkup(createElement(CardView, {
    card: { id: `${rank}-${suit}`, rank, suit, faceUp: true }, cardFaces,
  })).replaceAll('src="/cards/', 'src="../public/cards/')
  const pair = (rank, suit) => `<div class="pair"><div class="caption">${rank} of ${suit}</div><div class="twocards"><div><small>Simplified</small>${renderCard(rank, suit, 'simplified')}</div><div><small>Traditional</small>${renderCard(rank, suit, 'traditional')}</div></div></div>`
  const mobile = (width) => `<section class="mobile"><h2>${width}px viewport · ${Math.round((width - 24 - 6 * 3.2) / 7)}px cards</h2><div class="mobile-row" style="--zen-card-width:${(width - 24 - 6 * 3.2) / 7}px;--zen-card-height:calc(var(--zen-card-width) * 1.4)">${cards.map(([rank, suit]) => `<div><small>${rank} ${suit}</small>${renderCard(rank, suit, 'simplified')}</div>`).join('')}</div></section>`
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>M19G Solitaire card comparison</title><style>
    :root { --zp-card-ink:#171717; --zp-card-red:#bd2029; font-family:Arial,Helvetica,sans-serif; color:#17251f; }
    body { margin:0; padding:24px; background:#ecf1ed; }
    h1 { margin:0 0 5px; font-size:26px; } p { margin:0 0 20px; } h2 { font-size:18px; margin:22px 0 10px; }
    .grid { display:flex; flex-wrap:wrap; gap:16px; }
    .pair { padding:12px; border-radius:10px; background:#fff; box-shadow:0 1px 4px #0002; }
    .caption { font-weight:700; margin-bottom:8px; text-transform:capitalize; }
    .twocards { display:flex; gap:14px; --zen-card-width:88px; --zen-card-height:123.2px; }
    .twocards > div, .courts > div, .mobile-row > div { display:grid; gap:5px; justify-items:center; }
    small { font-weight:700; }
    .courts { display:flex; gap:16px; --zen-card-width:88px; --zen-card-height:123.2px; }
    .mobile { width:max-content; background:#fff; border-radius:10px; padding:10px 12px 14px; margin-top:16px; }
    .mobile-row { display:flex; gap:16px; }
    .zen-playing-card { display:block; width:var(--zen-card-width); height:var(--zen-card-height); border-radius:6px; }
    .zen-card-face { position:relative; overflow:hidden; border:1px solid #bab7ae; background:#fff; box-sizing:border-box; color:var(--zp-card-ink); padding:0; box-shadow:0 1px 3px #0003; }
    .zen-card-art { width:100%; height:100%; object-fit:contain; display:block; }
    .zen-card-corner { position:absolute; z-index:1; display:flex; flex-direction:column; align-items:center; gap:.03em; padding:1px; background:#fff; font-size:clamp(.82rem,calc(var(--zen-card-width) * .32),1.22rem); font-weight:800; line-height:1; }
    .zen-card-corner--top { top:1px; left:1px; } .zen-card-corner--bottom { right:1px; bottom:1px; transform:rotate(180deg); }
    .zen-card-corner__suit { width:1.02em; height:1.02em; } .zen-card-corner__rank--double { font-size:.9em; letter-spacing:-.08em; white-space:nowrap; }
    .zen-card-face--simplified .zen-card-corner { font-size:clamp(1rem,calc(var(--zen-card-width) * .38),1.45rem); font-weight:900; }
    .zen-card-suit--red { color:var(--zp-card-red); } .zen-card-suit--black { color:var(--zp-card-ink); }
  </style></head><body><h1>M19G · Simplified Solitaire cards</h1><p>One central suit on A–10. Traditional remains available. Court artwork is shared.</p><div class="grid">${cards.map(([rank,suit])=>pair(rank,suit)).join('')}</div><h2>Approved court artwork in both styles</h2><div class="courts">${['J','Q','K'].map(rank=>`<div><small>${rank} of Hearts</small>${renderCard(rank,'hearts','simplified')}</div>`).join('')}</div>${mobile(320)}${mobile(390)}</body></html>`
  await writeFile('context/M19G_SIMPLIFIED_CARD_FACES_COMPARISON.html', html)
} finally {
  await vite.close()
}
