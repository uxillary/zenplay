// Run Vite and a disposable Edge/Chrome profile with --remote-debugging-port=9224 first.
// This runner writes only to the disposable browser profile and context/M19I_evidence.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const origin = 'http://127.0.0.1:5173'
const target = await (await fetch('http://127.0.0.1:9224/json/new?' + origin, { method: 'PUT' })).json()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
let serial = 0
const pending = new Map()
ws.onmessage = ({ data }) => {
  const reply = JSON.parse(data), entry = pending.get(reply.id)
  if (!entry) return
  pending.delete(reply.id)
  if (reply.error) entry.reject(Error(reply.error.message))
  else entry.resolve(reply.result)
}
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++serial
  const timeout=setTimeout(()=>{pending.delete(id);reject(Error('Timed out: '+method+' '+JSON.stringify(params).slice(0,160)))},15000)
  pending.set(id, { resolve:value=>{clearTimeout(timeout);resolve(value)}, reject:error=>{clearTimeout(timeout);reject(error)} })
  ws.send(JSON.stringify({ id, method, params }))
})
const wait = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms))
const evaluate = async expression => {
  const reply = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (reply.exceptionDetails) throw Error(JSON.stringify(reply.exceptionDetails))
  return reply.result.value
}
const click = text => evaluate(`[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(text)})?.click()`)
const evidence = []
await mkdir('context/M19I_evidence', { recursive: true })
const shot = async name => {
  await wait()
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(`context/M19I_evidence/${name}.png`, Buffer.from(data, 'base64'))
}
const viewport = async (width, height = 850) => {
  await send('Emulation.setDeviceMetricsOverride', { width, height, mobile: width < 600, deviceScaleFactor: 1 })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  await wait()
}
const open = async () => {
  await send('Page.navigate', { url: origin })
  for(let i=0;i<30;i++){if(await evaluate(`!!document.querySelector('button')`))break;await wait(200)}
  await evaluate(`[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Solitaire'))?.click()`)
  for(let i=0;i<30;i++){if(await evaluate(`!!document.querySelector('.zen-solitaire-table')`))break;await wait(200)}
  assert.ok(await evaluate(`!!document.querySelector('.zen-solitaire-table')`))
  await evaluate('window.scrollTo(0,0)')
  await wait(180)
}
const fixture = async (kind = 'long', settings = {}) => {
  await evaluate(`(async () => {
    const { localDatabase } = await import('/src/persistence/database.ts')
    const { defaultSettings, serializeSettings } = await import('/src/lib/settings.ts')
    const { createInitialState } = await import('/src/games/solitaire/model/deal.ts')
    const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'], suits=['clubs','diamonds','hearts','spades']
    const deck=suits.flatMap(suit=>ranks.map(rank=>({id:suit+'-'+rank,rank,suit,faceUp:true})))
    const take=(rank,suit)=>deck.splice(deck.findIndex(x=>x.rank===rank&&x.suit===suit),1)[0]
    let game={tableau:[[],[],[],[],[],[],[]],foundations:[[],[],[],[]],waste:[],stock:[],history:[]}
    if (${JSON.stringify(kind)}==='courts') {
      for(let i=0;i<12;i++) {
        const card=take(['J','Q','K'][Math.floor(i/4)],suits[i%4])
        if(i<7)game.tableau[i].push(card)
        else if(i===7)game.waste.push(card)
        else game.foundations[i-8].push(card)
      }
    } else if (${JSON.stringify(kind)}==='win') {
      game.foundations=suits.map(suit=>ranks.slice(0,12).map(rank=>take(rank,suit)))
      game.tableau[0]=[take('K','clubs')];game.tableau[1]=[take('K','diamonds')];game.tableau[2]=[take('K','hearts')];game.tableau[3]=[take('K','spades')]
    } else if (${JSON.stringify(kind)}==='new') game=createInitialState()
    else {
      game.tableau[0]=[...ranks].reverse().map((rank,i)=>take(rank,i%2?'hearts':'spades'))
      game.tableau[2]=[take('A','clubs')]
      game.tableau[3]=[take('10','clubs')]
      game.waste=[take('9','diamonds')]
    }
    if (${JSON.stringify(kind)}!=='new') game.stock=deck.map(x=>({...x,faceUp:false}))
    const now=new Date().toISOString()
    await localDatabase.putSave({schemaVersion:1,gameId:'solitaire',sessionId:'m19i-'+${JSON.stringify(kind)},createdAt:now,updatedAt:now,state:{gameState:game,drawMode:'one'}})
    localStorage.setItem('zenplay-settings',serializeSettings({...defaultSettings,...${JSON.stringify(settings)}}))
  })()`)
  await open()
}
const saved = () => evaluate(`import('/src/persistence/database.ts').then(x=>x.localDatabase.getSave('solitaire')).then(x=>x?.state.gameState)`)
const point = selector => evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) throw Error('Missing '+${JSON.stringify(selector)}); const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+10} })()`)
const touch = (type, p) => send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ ...p, id: 1 }] : [] })
const drag = async (source, destination, cancel = false, screenshot) => {
  const a = await point(source), b = await point(destination)
  await touch('touchStart', a)
  for (let i = 1; i <= 8; i++) { await touch('touchMove', { x: a.x + (b.x-a.x)*i/8, y: a.y + (b.y-a.y)*i/8 }); await wait(20) }
  assert.equal(await evaluate(`!!document.querySelector('.zen-drag-layer')`), true)
  const appearance=await evaluate(`(() => { const a=document.querySelector(${JSON.stringify(source)}),b=document.querySelector('.zen-drag-layer .zen-playing-card');const read=x=>({font:getComputedStyle(x.querySelector('.zen-card-corner')).fontSize,border:getComputedStyle(x).borderColor,shadow:getComputedStyle(x).boxShadow});return {source:read(a),preview:read(b)}})()`)
  assert.ok(Math.abs(parseFloat(appearance.preview.font)-parseFloat(appearance.source.font))<0.02)
  assert.equal(appearance.preview.border,appearance.source.border)
  assert.equal(appearance.preview.shadow,appearance.source.shadow)
  if (screenshot) await shot(screenshot)
  await touch(cancel ? 'touchCancel' : 'touchEnd')
  await wait()
  assert.equal(await evaluate(`!!document.querySelector('.zen-drag-layer')`), false)
}
const geometry = () => evaluate(`(() => {const r=document.querySelector('.zen-solitaire-table').getBoundingClientRect();const c=document.querySelector('.zen-playing-card').getBoundingClientRect();return {viewport:innerWidth,page:document.documentElement.scrollWidth,x:r.x,width:r.width,cardWidth:c.width,cardHeight:c.height,scrollY}})()`)

try {
  await send('Page.enable')
  await send('Page.bringToFront')
  await open()
  evidence.push({ browser: (await send('Browser.getVersion')).product })
  for (const width of [320,360,390,404,430,768,1280]) {
    await viewport(width)
    await fixture('new')
    const before = await geometry()
    assert.ok(before.page <= width && before.page >= width-17)
    assert.ok(Math.abs(before.cardHeight/before.cardWidth-1.4)<0.02,JSON.stringify(before))
    if ([320,390,1280].includes(width)) await shot(`new-${width}`)
    await click('Menu'); await wait()
    const menu = await geometry()
    assert.equal(menu.x,before.x); assert.equal(menu.width,before.width)
    if (width===390) { await shot('menu-390'); await click('Appearance'); await shot('appearance-390') }
    evidence.push({ width, before, menu, result:'PASS' })
  }
  for (const width of [320,360,390,404,430]) {
    await viewport(width)
    await fixture('long')
    const before=await geometry()
    if ([320,390].includes(width)) await shot(`long-${width}`)
    await drag('[data-solitaire-drop="tableau:0"] .zen-card-draggable','[data-solitaire-drop="tableau:1"]',false,width===390?'drag-390':undefined)
    const after=await saved()
    assert.equal(after.history.length,1); assert.equal(after.tableau[1].length,13)
    const moved=await geometry(); assert.equal(moved.page,width);assert.equal(moved.width,before.width);assert.equal(moved.scrollY,before.scrollY)
    await click('Undo'); await wait(); assert.equal((await saved()).tableau[0].length,13)
    await drag('[data-solitaire-drop="tableau:0"] .zen-card-draggable','[data-solitaire-drop="foundation:0"]')
    assert.equal((await saved()).history.length,0)
    await drag('[data-solitaire-drop="tableau:0"] .zen-card-draggable','[data-solitaire-drop="tableau:1"]',true)
    assert.equal((await saved()).history.length,0)
    const a=await point('[data-solitaire-drop="tableau:2"] .zen-card-draggable')
    await touch('touchStart',a); await touch('touchMove',{x:a.x+2,y:a.y+2}); await touch('touchEnd')
    await wait()
    assert.equal(await evaluate(`document.querySelector('[data-solitaire-drop="tableau:2"] button').getAttribute('aria-pressed')`),'true')
    await evaluate(`document.querySelector('[data-solitaire-drop="foundation:0"]').click()`)
    await wait()
    assert.equal((await saved()).foundations[0][0].id,'clubs-A')
    await click('Undo');await wait()
    for(const selector of ['[data-solitaire-drop="tableau:2"] button','[data-solitaire-drop="foundation:0"]']) {
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`)
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13})
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
      await wait(20)
    }
    await wait();assert.equal((await saved()).history.length,1)
    evidence.push({ width, longDrag:'PASS', invalidDrop:'PASS', cancel:'PASS', geometry:moved })
  }
  await viewport(390)
  for (const style of ['classic','large-print']) for (const faces of ['simplified','traditional']) {
    await fixture('courts',{solitaireCardStyle:style,solitaireCardFaces:faces})
    await shot(`courts-${faces}-${style}-390`)
  }
  for (const back of ['classic-blue','traditional-red','high-contrast']) {
    await fixture('new',{solitaireCardBack:back})
    await shot(`back-${back}-390`)
  }
  await fixture('long',{solitaireCardStyle:'large-print',highContrast:true,reducedMotion:true})
  await shot('accessible-390')
  await drag('[data-solitaire-drop="tableau:0"] .zen-card-draggable','[data-solitaire-drop="tableau:1"]',false,'accessible-drag-390')
  await open();assert.equal((await saved()).tableau[1].length,13)
  await fixture('win');await click('Menu');await click('Auto-finish cards');await wait()
  assert.ok(await evaluate(`document.body.textContent.includes('You did it.')`))
  await shot('win-390')
  evidence.push({win:'PASS',saveRestore:'PASS'})
  await fixture('long')
  await click('Hint');assert.ok(await evaluate(`!!document.querySelector('.zen-hint-source')`));await click('Dismiss')
  await click('Menu');await click('Appearance')
  await evaluate(`(() => { const values=['burgundy','large-print','traditional','traditional-red'];document.querySelectorAll('[role=dialog] select').forEach((el,i)=>{el.value=values[i];el.dispatchEvent(new Event('change',{bubbles:true}))}) })()`)
  await wait();await click('Close Appearance');await click('Menu');await click('Game Options')
  await evaluate(`document.querySelectorAll('[role=dialog] input[type=checkbox]')[1].click()`)
  await click('Close Game Options');await open()
  const preferences=await evaluate(`JSON.parse(localStorage.getItem('zenplay-settings')).settings`)
  assert.equal(preferences.solitaireCardStyle,'large-print');assert.equal(preferences.solitaireCardFaces,'traditional');assert.equal(preferences.solitaireCardBack,'traditional-red');assert.equal(preferences.solitaireShowPossibleMoves,true)
  await click('‹ Games');await evaluate(`[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Solitaire'))?.click()`);await wait()
  assert.equal((await saved()).tableau[0].length,13)
  evidence.push({settingsUIAndReload:'PASS',hint:'PASS',navigateAwayAndReturn:'PASS'})
  await viewport(1280)
  await fixture('long')
  const a=await point('[data-solitaire-drop="tableau:0"] .zen-card-draggable'),b=await point('[data-solitaire-drop="tableau:1"]')
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...a,button:'left',clickCount:1})
  for(let i=1;i<=8;i++){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:a.x+(b.x-a.x)*i/8,y:a.y+(b.y-a.y)*i/8,button:'left',buttons:1});await wait(20)}
  assert.ok(await evaluate(`!!document.querySelector('.zen-drag-layer')`),JSON.stringify({a,b,geometry:await geometry()}))
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',...b,button:'left',clickCount:1});await wait()
  assert.equal((await saved()).history.length,1)
  evidence.push({desktopMouseDrag:'PASS'})
  for(const width of [640,320]) {await viewport(width,500);await shot(`zoom-${width===640?200:400}`);assert.ok((await geometry()).page<=width)}
  await writeFile('context/M19I_evidence/results.json',JSON.stringify(evidence,null,2)+'\n')
  console.log(JSON.stringify(evidence,null,2))
} finally { await send('Target.closeTarget',{targetId:target.id}).catch(()=>{});ws.close() }
