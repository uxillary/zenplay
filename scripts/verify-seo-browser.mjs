// Built-app acceptance with a disposable headless Edge/Chromium profile.
// Run npm run build first. Does not use an existing browser profile or live account.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { preview } from 'vite'
import { gameCases, pageCases, utilityCases } from './seoCases.mjs'

const executable = process.env.ZENPLAY_TEST_BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
assert.ok(existsSync(executable), 'Set ZENPLAY_TEST_BROWSER to a Chromium/Edge executable')
const profile = await mkdtemp(join(tmpdir(), 'zenplay-m20b2-'))
let workerVersion = 1
const workerSource = await readFile(new URL('../dist/sw.js', import.meta.url), 'utf8')
const server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: true }, plugins: [{
  name: 'fixture-service-worker-update',
  configurePreviewServer(server) {
    server.middlewares.use((request, response, next) => {
      if (new URL(request.url, 'http://localhost').pathname === '/__m20-private.json') { response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); response.end('{"privateFixture":true}'); return }
      if (new URL(request.url, 'http://localhost').pathname !== '/sw.js') return next()
      response.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' })
      response.end(`${workerSource}\n// Acceptance fixture version ${workerVersion}\n`)
    })
  },
}] })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const browser = spawn(executable, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', 'about:blank'], { windowsHide: true, stdio: 'ignore' })
const pause = (ms = 100) => new Promise((done) => setTimeout(done, ms))
let socket, serial = 0
const pending = new Map(), errors = [], consoleWarnings = []
const send = (method, params = {}) => new Promise((done, fail) => {
  const id = ++serial
  const timer = setTimeout(() => { pending.delete(id); fail(Error(`Timed out: ${method}`)) }, 20000)
  pending.set(id, { done: (value) => { clearTimeout(timer); done(value) }, fail: (error) => { clearTimeout(timer); fail(error) } })
  socket.send(JSON.stringify({ id, method, params }))
})
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const waitFor = async (expression, label = expression) => {
  const deadline = Date.now() + 20000
  while (Date.now() < deadline) {
    try { if (await evaluate(expression)) return } catch { /* Navigation replaces execution contexts. */ }
    await pause()
  }
  throw Error(`Did not observe: ${label}`)
}
const navigate = async (path) => {
  await send('Page.navigate', { url: origin + path })
  await waitFor(`location.pathname === ${JSON.stringify(path.split('?')[0])} && document.readyState === 'complete'`)
}
const gameReady = () => waitFor(`!!document.querySelector('.zen-solitaire-table')`, 'interactive Solitaire')
const homeReady = () => waitFor(`document.querySelector('h1')?.textContent === 'Choose a game' && !!document.querySelector('.zen-game-card--solitaire a.zen-game-button--primary')`, 'interactive library')
const click = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
const storeOperation = (store, key, value) => evaluate(`new Promise((done, fail) => {
  const opening = indexedDB.open('zenplay-local', 1)
  opening.onerror = () => fail(opening.error)
  opening.onsuccess = () => {
    const db = opening.result
    const transaction = db.transaction(${JSON.stringify(store)}, ${value === undefined ? "'readonly'" : "'readwrite'"})
    const request = transaction.objectStore(${JSON.stringify(store)}).${value === undefined ? `get(${JSON.stringify(key)})` : `put(${JSON.stringify(value)})`}
    let result
    request.onsuccess = () => { result = request.result }
    transaction.oncomplete = () => { db.close(); done(result) }
    transaction.onerror = () => { db.close(); fail(transaction.error) }
  }
})`)
const readSave = () => storeOperation('gameSaves', 'solitaire')

try {
  let port
  for (let i = 0; i < 100; i++) {
    try { port = Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break } catch { await pause() }
  }
  assert.ok(port, 'Browser debugging endpoint did not start')
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((done, fail) => { socket.onopen = done; socket.onerror = fail })
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text)
    if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) {
      consoleWarnings.push(message.params.args.map((arg) => arg.value ?? arg.description).join(' '))
    }
    const entry = pending.get(message.id)
    if (!entry) return
    pending.delete(message.id)
    if (message.error) entry.fail(Error(JSON.stringify(message.error)))
    else entry.done(message.result)
  }
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await send('Emulation.setScriptExecutionDisabled', { value: true })
  for (const { path, heading } of pageCases) {
    await navigate(path)
    assert.equal(await evaluate(`document.querySelector('h1').textContent`), heading)
    assert.equal(await evaluate(`document.querySelectorAll('main').length`), 1)
    assert.equal(await evaluate(`document.querySelectorAll('h1').length`), 1)
    assert.equal(await evaluate(`!!document.querySelector('.zen-solitaire-table')`), false)
    assert.ok(await evaluate(`document.body.innerText.includes('Playing games needs JavaScript')`))
  }
  await navigate('/games/solitaire/')
  assert.ok(await evaluate(`document.body.innerText.includes('Only a King may start an empty column')`))
  console.log('PASS JS disabled: all 13 page shells, useful rules, no fake board, one H1/main')

  await send('Emulation.setScriptExecutionDisabled', { value: false })
  await send('Page.reload')
  await gameReady()
  await waitFor(`new Promise(done => { const r=indexedDB.open('zenplay-local');r.onsuccess=()=>{const d=r.result;const q=d.transaction('gameSaves').objectStore('gameSaves').get('solitaire');q.onsuccess=()=>{d.close();done(!!q.result)}}})`)
  assert.equal(await evaluate(`document.title`), 'Free Solitaire, No Adverts — ZenPlay')
  assert.equal(await evaluate(`document.querySelector('link[rel=canonical]').href`), 'https://playadfree.games/games/solitaire/')
  assert.equal(await evaluate(`document.querySelectorAll('h1').length`), 1)
  assert.equal(await evaluate(`document.querySelectorAll('main').length`), 1)
  const existing = await readSave()
  assert.equal(existing.schemaVersion, 1)
  const documentMarker = await evaluate(`window.__m20document = 'same document'`)
  await click('a[aria-label="Back to Games"]')
  await homeReady()
  assert.equal(await evaluate(`location.pathname`), '/')
  assert.equal(await evaluate(`window.__m20document`), documentMarker)
  await waitFor(`!![...document.querySelectorAll('a')].find(x => x.textContent === 'Continue Solitaire')`)
  await evaluate(`[...document.querySelectorAll('a')].find(x => x.textContent === 'Continue Solitaire').click()`)
  await gameReady()
  assert.equal((await readSave()).sessionId, existing.sessionId)
  await evaluate('history.back()')
  await homeReady()
  await evaluate('history.forward()')
  await gameReady()
  assert.equal(await evaluate(`window.__m20document`), documentMarker)
  await send('Page.reload')
  await gameReady()
  assert.equal((await readSave()).sessionId, existing.sessionId)
  console.log('PASS direct entry, hydration, explicit Home, Continue, refresh, native history and same-document navigation')

  // Complete catalogue: use normal library links, make real moves, resume all
  // six save formats, then exercise native Back/Forward and direct refresh.
  for (const game of gameCases) {
    await navigate('/')
    await homeReady()
    await evaluate(`window.__catalogueDocument = true`)
    await click(`.zen-game-card a[href="${game.path}"]`)
    await waitFor(`!!document.querySelector(${JSON.stringify(game.selector)}) && history.state?.zenplayNavigationVersion === 2`, game.heading)
    assert.equal(await evaluate('location.pathname'), game.path)
    assert.equal(await evaluate('window.__catalogueDocument'), true)
    assert.equal(await evaluate(`document.querySelector('h1').textContent`), game.heading)
    assert.equal(await evaluate(`document.querySelectorAll('h1').length`), 1)
    assert.equal(await evaluate(`document.querySelectorAll('main').length`), 1)
    assert.equal(await evaluate(`document.querySelector('link[rel=canonical]').href`), `https://playadfree.games${game.path}`)
    assert.equal(await evaluate(`JSON.parse(document.getElementById('zenplay-structured-data').textContent)['@graph'].find(x=>x['@type']==='VideoGame').name`), game.heading)
    const ax = await send('Accessibility.getFullAXTree')
    assert.deepEqual(ax.nodes.filter(node => !node.ignored && ['button','link'].includes(node.role?.value) && !node.name?.value).map(node=>node.nodeId), [], `${game.id}: unnamed control`)
    await click('a[href="#main-content"]')
    assert.equal(await evaluate('document.activeElement.id'), 'main-content')
    for (const width of [320, 390]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true })
      assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), `${game.id}: page overflow at ${width}`)
    }
    let seed, expectedStatistics
    if (game.resume) {
      await waitFor(`new Promise(done=>{const r=indexedDB.open('zenplay-local');r.onsuccess=()=>{const d=r.result,q=d.transaction('gameSaves').objectStore('gameSaves').get(${JSON.stringify(game.id)});q.onsuccess=()=>{d.close();done(!!q.result)}}})`)
      seed = await storeOperation('gameSaves', game.id)
      seed.sessionId = `m20b2-existing-${game.id}`
      seed.createdAt = '2026-11-16T12:00:00.000Z'
      assert.equal(seed.schemaVersion, 1)
      await storeOperation('gameSaves', null, seed)
      expectedStatistics = { schemaVersion:1,gameId:game.id,gamesStarted:7,gamesCompleted:3,totalMoves:12,bestMoves:4,lastCompletedSessionId:'existing',completionBreakdown:{} }
      await storeOperation('statistics', null, expectedStatistics)
      await send('Page.reload')
      await waitFor(`!!document.querySelector(${JSON.stringify(game.selector)})`)
      await evaluate(`(() => {
        const d=Object.getOwnPropertyDescriptor(IDBTransaction.prototype,'oncomplete')
        Object.defineProperty(IDBTransaction.prototype,'oncomplete',{...d,set(handler){d.set.call(this,this.mode==='readwrite'&&this.objectStoreNames.contains('gameSaves')?function(event){setTimeout(()=>handler.call(this,event),250)}:handler)}})
      })()`)
    }
    if (game.id === 'solitaire') await click('button[aria-label^="Stock,"]')
    if (game.id === 'sudoku') {
      const index=seed.state.values.indexOf(0)
      await evaluate(`document.querySelectorAll('.sudoku-board [role=gridcell]')[${index}].click()`)
      await click('button[aria-label="Enter 1"]')
    }
    if (game.id === 'pairs') {
      const cards=seed.state.cards, second=cards.findIndex((card,index)=>index>0&&card.pairId===cards[0].pairId)
      await click('.pairs-grid button:nth-child(1)');await pause(30);await click(`.pairs-grid button:nth-child(${second+1})`)
    }
    if (game.id === 'word-search') {
      const endpoints=await evaluate(`(() => {
        const word=document.querySelector('.word-search-word-list li:not(.word-search-word--found) span:nth-child(2)').textContent
        const letters=[...document.querySelectorAll('[data-word-cell]')].map(x=>x.textContent), size=Math.sqrt(letters.length)
        for(let row=0;row<size;row++)for(let col=0;col<size;col++)for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]]) {
          const cells=[...word].map((_,i)=>[row+i*dr,col+i*dc]);if(cells.every(([r,c],i)=>r>=0&&r<size&&c>=0&&c<size&&letters[r*size+c]===word[i]))return [cells[0][0]*size+cells[0][1],cells.at(-1)[0]*size+cells.at(-1)[1]]
        }
      })()`)
      assert.ok(endpoints)
      await click(`[data-word-cell="${endpoints[0]}"]`);await pause(30);await click(`[data-word-cell="${endpoints[1]}"]`)
    }
    if (game.id === 'fifteen') {
      const blank=seed.state.tiles.indexOf(null), adjacent=[blank-4,blank+4,blank%4?blank-1:-1,blank%4<3?blank+1:-1].find(index=>index>=0&&index<16)
      await click(`.fifteen-board button:nth-child(${adjacent+1})`)
    }
    if (game.id === 'mahjong') {
      const freeIds=await evaluate(`[...document.querySelectorAll('.mahjong-tile[aria-disabled="false"]')].map(x=>x.id.replace('mahjong-',''))`)
      const free=seed.state.tiles.filter(tile=>freeIds.includes(tile.id)), first=free.find(tile=>free.some(other=>other.id!==tile.id&&(other.matchKey===tile.matchKey||['flowers','seasons'].includes(tile.family)&&other.family===tile.family)))
      const second=free.find(tile=>tile.id!==first.id&&(tile.matchKey===first.matchKey||['flowers','seasons'].includes(tile.family)&&tile.family===first.family))
      await click(`#mahjong-${first.id}`);await pause(30);await click(`#mahjong-${second.id}`)
    }
    if (game.id === 'noughts-crosses') {
      await evaluate(`[...document.querySelectorAll('button')].find(x=>x.textContent==='Two Players').click()`)
      await pause(30)
      await evaluate(`document.querySelector('.noughts-board button').focus()`)
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13})
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
      await waitFor(`document.querySelector('.noughts-board button').textContent.trim()==='×'`)
    }
    if (game.id === 'flags') {
      await evaluate(`[...document.querySelectorAll('button')].find(x=>x.textContent==='Start game').click()`)
      await waitFor(`!!document.querySelector('.flags-screen__choice')`)
      await click('.flags-screen__choice')
      await waitFor(`document.querySelector('.flags-screen__choice').disabled`)
    }
    await pause(40)
    await click('.zen-game-shell__header a[href="/"]')
    await homeReady()
    if (game.resume) {
      await waitFor(`!!document.querySelector(${JSON.stringify(`.zen-game-card--${game.id.replace('-','')} a.zen-game-button--primary`)})`)
      await click(`.zen-game-card--${game.id.replace('-','')} a.zen-game-button--primary`)
    } else {
      assert.equal(await evaluate(`!!document.querySelector(${JSON.stringify(`.zen-game-card--${game.id.replace('-','')} .zen-game-button--primary`)})`),false)
      await click(`.zen-game-card a[href="${game.path}"]`)
    }
    await waitFor(`!!document.querySelector(${JSON.stringify(game.selector)})`)
    if (game.resume) {
      const restored=await storeOperation('gameSaves',game.id)
      assert.equal(restored.sessionId,seed.sessionId)
      assert.notDeepEqual(restored.state,seed.state,`${game.id}: real move was not saved`)
      assert.deepEqual(await storeOperation('statistics',game.id),expectedStatistics)
      if(game.id==='sudoku')assert.ok(await evaluate(`[...document.querySelectorAll('.sudoku-board [role=gridcell]')][${seed.state.values.indexOf(0)}].textContent.trim()==='1'`))
      if(game.id==='pairs')assert.equal(restored.state.matchedPairIds.length,seed.state.matchedPairIds.length+1)
      if(game.id==='word-search')assert.equal(restored.state.foundWords.length,seed.state.foundWords.length+1)
      if(game.id==='fifteen')assert.equal(restored.state.moves,seed.state.moves+1)
      if(game.id==='mahjong')assert.equal(restored.state.moves,seed.state.moves+1)
    }
    await evaluate('history.back()');await homeReady();await evaluate('history.forward()')
    await waitFor(`!!document.querySelector(${JSON.stringify(game.selector)})`)
    await send('Page.reload');await waitFor(`!!document.querySelector(${JSON.stringify(game.selector)})`)
    await navigate(game.path);await waitFor(`!!document.querySelector(${JSON.stringify(game.selector)})`)
    assert.equal(await evaluate(`document.querySelector('h1').textContent`),game.heading)
    console.log(`PASS ${game.path}: hydration, named controls, mobile widths, gameplay, Home, history, refresh${game.resume?', existing save/Continue/statistics':''}`)
  }
  for (const page of utilityCases) {
    await navigate(page.path)
    await waitFor(`history.state?.zenplayNavigationVersion===2 && document.querySelector('h1')?.textContent===${JSON.stringify(page.heading)} && !document.body.innerText.includes(${JSON.stringify(`Loading ${page.heading}…`)})`)
    assert.equal(await evaluate(`document.querySelectorAll('h1').length`),1)
    assert.equal(await evaluate(`document.querySelector('meta[name=robots]').content`),'noindex,follow')
    assert.equal(await evaluate(`!!document.getElementById('zenplay-structured-data')`),false)
    await send('Page.reload')
    await waitFor(`history.state?.zenplayNavigationVersion===2 && document.querySelector('h1')?.textContent===${JSON.stringify(page.heading)} && !document.body.innerText.includes(${JSON.stringify(`Loading ${page.heading}…`)})`)
  }
  await navigate('/games/solitaire/');await gameReady()

  // Give the slice a valid save/statistics/preferences from the pre-M20 formats.
  const fixture = await evaluate(`(() => {
    const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'], suits=['clubs','diamonds','hearts','spades']
    const deck=suits.flatMap(suit=>ranks.map(rank=>({id:suit+'-'+rank,rank,suit,faceUp:true})))
    const take=(rank,suit)=>deck.splice(deck.findIndex(card=>card.rank===rank&&card.suit===suit),1)[0]
    const gameState={tableau:[[],[],[],[],[],[],[]],foundations:[[],[],[],[]],waste:[],stock:[],history:[]}
    gameState.tableau[0]=[...ranks].reverse().map((rank,i)=>take(rank,i%2?'hearts':'spades'))
    gameState.tableau[2]=[take('A','clubs')];gameState.tableau[3]=[take('10','clubs')];gameState.waste=[take('9','diamonds')]
    gameState.stock=deck.map(card=>({...card,faceUp:false}))
    return {schemaVersion:1,gameId:'solitaire',sessionId:'m20b1-existing-save',createdAt:'2026-11-16T12:00:00.000Z',updatedAt:'2026-11-16T12:00:00.000Z',state:{gameState,drawMode:'one'}}
  })()`)
  await storeOperation('gameSaves', null, fixture)
  const statistics = { schemaVersion: 1, gameId: 'solitaire', gamesStarted: 7, gamesCompleted: 3, totalMoves: 12, bestMoves: 4, lastCompletedSessionId: 'pre-m20', completionBreakdown: {} }
  await storeOperation('statistics', null, statistics)
  const preferences = await evaluate(`(() => {
    const value=JSON.parse(localStorage.getItem('zenplay-settings'))
    value.settings={...value.settings,theme:'light',uiScale:'large',gamePieceScale:'large',highContrast:true,reducedMotion:true}
    const raw=JSON.stringify(value);localStorage.setItem('zenplay-settings',raw)
    localStorage.setItem('zenplay-local-profile',JSON.stringify({schemaVersion:1,profileId:'m20b1-local',displayName:'Local fixture',createdAt:'2026-11-16T12:00:00.000Z',favouriteGameId:'solitaire',visibility:'private'}))
    return value.settings
  })()`)
  await send('Page.reload')
  await gameReady()
  assert.equal((await readSave()).sessionId, fixture.sessionId)
  assert.deepEqual(await storeOperation('statistics', 'solitaire'), statistics)
  assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('zenplay-settings')).settings`), preferences)
  assert.ok(await evaluate(`document.documentElement.classList.contains('high-contrast') && document.documentElement.classList.contains('reduced-motion')`))
  assert.equal(await evaluate(`document.querySelector('.zen-solitaire-table').getBoundingClientRect().top < innerHeight / 2`), true)

  // Delay transaction-completion notifications to exercise queued writes rather
  // than only waiting for already-saved positions before navigation.
  await evaluate(`(() => {
    const descriptor=Object.getOwnPropertyDescriptor(IDBTransaction.prototype,'oncomplete')
    Object.defineProperty(IDBTransaction.prototype,'oncomplete',{...descriptor,set(handler){
      descriptor.set.call(this, this.mode==='readwrite' && this.objectStoreNames.contains('gameSaves')
        ? function(event){setTimeout(()=>handler.call(this,event),250)} : handler)
    }})
  })()`)
  await click('button[aria-label^="Stock,"]')
  await pause(40)
  await click('button[aria-label^="Stock,"]')
  await pause(40)
  await click('a[aria-label="Back to Games"]')
  await homeReady()
  await evaluate(`[...document.querySelectorAll('a')].find(x => x.textContent === 'Continue Solitaire').click()`)
  await gameReady()
  await pause(800)
  const afterPending = await readSave()
  assert.equal(afterPending.sessionId, fixture.sessionId)
  assert.equal(afterPending.state.gameState.history.length, 2, 'Both queued stock moves must survive Home/Continue')
  assert.equal(afterPending.state.gameState.waste.length, 3)
  assert.ok(await evaluate(`[...document.querySelectorAll('.zen-game-stat')].some(x => x.textContent === 'Moves 2')`), 'The resumed board must agree with the latest saved position')
  assert.deepEqual(await storeOperation('statistics', 'solitaire'), statistics)
  assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('zenplay-settings')).settings`), preferences)
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('zenplay-local-profile')).profileId`), 'm20b1-local')
  console.log('PASS pre-M20 saves, statistics, accessibility/profile storage and pending writes through Home/Continue')

  const point = (selector) => evaluate(`(() => {const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+10}})()`)
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  const source = await point('[data-solitaire-drop="tableau:0"] .zen-card-draggable')
  const destination = await point('[data-solitaire-drop="tableau:1"]')
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...source, id: 1 }] })
  for (let i = 1; i <= 8; i++) {
    await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: source.x + (destination.x - source.x) * i / 8, y: source.y + (destination.y - source.y) * i / 8, id: 1 }] })
  }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await waitFor(`[...document.querySelectorAll('.zen-game-stat')].some(x=>x.textContent==='Moves 3')`, 'touch-dragged stack')
  await pause(350)
  assert.equal((await readSave()).state.gameState.tableau[1].length, 13)
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth`))
  console.log('PASS mobile-emulated touch drag and large-piece page width')

  // Native modifiers must leave the current SPA screen alone. Cancellation of
  // default here avoids opening extra tabs; a separate fresh entry tests new-tab semantics.
  await click('a[aria-label="Back to Games"]')
  await homeReady()
  for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }]) {
    assert.equal(await evaluate(`(() => {
      const link=document.querySelector('a[href="/games/solitaire/"]')
      const event=new MouseEvent('click',{bubbles:true,cancelable:true,...${JSON.stringify(modifiers)}})
      let prevented
      document.addEventListener('click', event => { prevented=event.defaultPrevented;event.preventDefault() }, {once:true})
      link.dispatchEvent(event)
      return prevented
    })()`), false)
    assert.equal(await evaluate('location.pathname'), '/')
  }
  // Legacy root entries hydrate Home first, then restore without a mismatch.
  await evaluate(`history.replaceState({foreignKey:7,zenplayNavigation:{screen:'game',gameId:'solitaire'}},'', '/')`)
  await send('Page.reload')
  await gameReady()
  assert.equal(await evaluate('location.pathname'), '/games/solitaire/')
  assert.equal(await evaluate('history.state.foreignKey'), 7)
  assert.equal(await evaluate('history.state.zenplayNavigationVersion'), 2)
  console.log('PASS modifier handling and legacy root-history migration with unrelated state retained')

  await click('a[aria-label="Back to Games"]'); await homeReady()
  await click('a[href="/profile/"]')
  await waitFor(`location.pathname==='/profile/' && document.querySelector('h1')?.textContent==='Profile' && !document.getElementById('zenplay-structured-data')`)
  await click('a[href="/support/"]')
  await waitFor(`location.pathname==='/support/' && document.querySelector('h1')?.textContent==='Support ZenPlay'`)
  assert.equal(await evaluate(`document.querySelector('meta[name=robots]').content`),'noindex,follow')
  await click('a[href="/profile/"].zen-game-button--back')
  await waitFor(`location.pathname==='/profile/'`)
  await click('a[href="/"].zen-game-button--back'); await homeReady()
  await evaluate(`document.documentElement.dataset.indexing='noindex'`)
  await click('.zen-game-card a[href="/games/sudoku/"]')
  await waitFor(`location.pathname==='/games/sudoku/' && !!document.querySelector('.sudoku-board')`)
  assert.equal(await evaluate(`document.querySelector('meta[name=robots]').content`),'noindex,follow')
  assert.equal(await evaluate(`document.querySelector('meta[property="og:url"]').content`),'https://playadfree.games/games/sudoku/')
  await click('.zen-game-shell__header a[href="/"]'); await homeReady()
  await send('Page.reload'); await homeReady()
  await navigate('/unknown-game-page/')
  await waitFor(`document.querySelector('h1')?.textContent==='Page not found'`)
  assert.equal(await evaluate(`!!document.querySelector('link[rel=canonical]')`),false)
  await navigate('/'); await homeReady()
  console.log('PASS live utility metadata/links, preview noindex retention and actual unknown-page rendering')

  // Home-only installation must cache the final game document and game chunks.
  await homeReady()
  // Reset only worker/cache data in this fixture profile, retaining local saves.
  await evaluate(`(async () => {
    await Promise.all((await navigator.serviceWorker.getRegistrations()).map(r=>r.unregister()))
    await Promise.all((await caches.keys()).map(key=>caches.delete(key)))
  })()`)
  await send('Page.reload')
  await homeReady()
  await waitFor(`navigator.serviceWorker.getRegistration().then(r => !!r?.active)`, 'active service worker')
  await send('Page.reload')
  await homeReady()
  await waitFor(`!!navigator.serviceWorker.controller`, 'controlling service worker')
  assert.ok(await evaluate(`(async () => {
    for (const name of await caches.keys()) {
      const cache=await caches.open(name)
      const request=(await cache.keys()).find(key=>new URL(key.url).pathname==='/games/solitaire/index.html')
      if (request) return (await (await cache.match(request)).text()).includes('Only a King may start an empty column')
    }
    return false
  })()`))
  await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 })
  for (const page of [...gameCases,...utilityCases]) {
    await navigate(page.path)
    await waitFor(`history.state?.zenplayNavigationVersion===2 && document.querySelector('h1')?.textContent===${JSON.stringify(page.heading)} && !document.body.innerText.includes(${JSON.stringify(`Loading ${page.heading}…`)})`)
    if(page.selector) await waitFor(`!!document.querySelector(${JSON.stringify(page.selector)})`)
    assert.equal(await evaluate(`document.querySelectorAll('h1').length`),1)
    assert.equal(await evaluate(`document.querySelectorAll('main').length`),1)
    assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`))
    await send('Page.reload')
    await waitFor(`history.state?.zenplayNavigationVersion===2 && document.querySelector('h1')?.textContent===${JSON.stringify(page.heading)} && !document.body.innerText.includes(${JSON.stringify(`Loading ${page.heading}…`)})`)
    if(page.selector) await waitFor(`!!document.querySelector(${JSON.stringify(page.selector)})`)
    if(page.id) {
      await pause(100)
      await writeFile(resolve(`node_modules/.tmp/m20b2-${page.id}.png`),Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'))
    }
    await send('Page.navigate',{url:`${origin}${page.path.slice(0,-1)}?source=offline`})
    await waitFor(`location.pathname===${JSON.stringify(page.path)} && history.state?.zenplayNavigationVersion===2`)
  }
  await navigate('/');await homeReady();await send('Page.reload');await homeReady()
  await navigate('/games/solitaire/');await gameReady()
  assert.equal((await readSave()).sessionId,fixture.sessionId)
  console.log('PASS offline Home, eight games, four utilities, reloads and every known query/alias after Home-only setup')
  await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 })

  assert.equal(await evaluate(`fetch('/__m20-private.json').then(r=>r.json()).then(data=>data.privateFixture)`),true)
  assert.equal(await evaluate(`caches.match('/__m20-private.json').then(Boolean)`),false)
  workerVersion = 2
  await evaluate(`window.__m20Waiting = true; navigator.serviceWorker.getRegistration().then(r=>r.update())`)
  await waitFor(`navigator.serviceWorker.getRegistration().then(r=>!!r?.waiting)`, 'new worker waits during play')
  await pause(300)
  assert.equal(await evaluate(`window.__m20Waiting`), true)
  assert.equal(await evaluate(`!![...document.querySelectorAll('button')].find(x=>x.textContent==='Update now')`), false)
  await click('a[aria-label="Back to Games"]')
  await homeReady()
  await waitFor(`!![...document.querySelectorAll('button')].find(x=>x.textContent==='Update now')`, 'user-controlled update prompt')
  await evaluate(`[...document.querySelectorAll('button')].find(x=>x.textContent==='Later').click()`)
  assert.equal(await evaluate(`navigator.serviceWorker.getRegistration().then(r=>!!r?.waiting)`), true)
  await send('Page.reload')
  await homeReady()
  await waitFor(`!![...document.querySelectorAll('button')].find(x=>x.textContent==='Update now')`)
  await evaluate(`window.__m20BeforeUpdate=true;[...document.querySelectorAll('button')].find(x=>x.textContent==='Update now').click()`)
  await waitFor(`!window.__m20BeforeUpdate && document.querySelector('h1')?.textContent==='Choose a game'`, 'accepted update reload')
  await homeReady()
  await waitFor(`!![...document.querySelectorAll('a')].find(x=>x.textContent==='Continue Solitaire')`)
  await evaluate(`[...document.querySelectorAll('a')].find(x=>x.textContent==='Continue Solitaire').click()`)
  await gameReady()
  assert.equal((await readSave()).sessionId, fixture.sessionId)
  assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('zenplay-settings')).settings`), preferences)
  console.log('PASS waiting worker: no active-game reload, Later, explicit Update now and retained local data')

  const screenshot = resolve('node_modules/.tmp/m20b2-solitaire.png')
  await writeFile(screenshot, Buffer.from((await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })).data, 'base64'))
  assert.deepEqual(errors, [], 'Browser runtime exceptions')
  assert.deepEqual(consoleWarnings, [], 'Browser console/hydration warnings')
  console.log(JSON.stringify({ browser: await send('Browser.getVersion'), viewport: '390×844', runtimeErrors: errors, consoleWarnings, screenshot, disposableProfile: profile }, null, 2))
} catch (error) {
  console.error(JSON.stringify({ runtimeErrors: errors, consoleWarnings }))
  throw error
} finally {
  socket?.close()
  browser.kill()
  await new Promise((done) => server.httpServer.close(done))
  // Leave the uniquely named disposable profile in the OS temporary directory.
  // It contains fixture-only local data and is never reused by this runner.
}
