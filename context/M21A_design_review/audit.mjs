// Local design-review evidence only. No personal browser profile or hosted service.
// From repository root: npm run build && node context/M21A_design_review/audit.mjs
import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { preview } from 'vite'
import { gameCases } from '../../scripts/seoCases.mjs'

const output = resolve('context/M21A_design_review')
const conceptsOnly = process.argv.includes('--concepts-only')
await mkdir(join(output, 'screenshots'), { recursive: true })
const profile = await mkdtemp(join(tmpdir(), 'zenplay-m21a-'))
const server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: true }, plugins: [{
  name: 'local-design-review', enforce: 'pre', configurePreviewServer(server) {
    server.middlewares.use((request, response, next) => {
      if (new URL(request.url, 'http://localhost').pathname !== '/__design-review/') return next()
      void readFile(join(output, 'concepts.html')).then(html => {
        response.writeHead(200, { 'Content-Type': 'text/html', 'X-Robots-Tag': 'noindex' }); response.end(html)
      }).catch(next)
    })
  },
}] })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const browser = spawn(process.env.ZENPLAY_TEST_BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', 'about:blank'],
  { windowsHide: true, stdio: 'ignore' })
let socket, serial = 0, completed = false
const pending = new Map(), errors = [], warnings = [], measurements = [], checks = []
const pause = (ms = 80) => new Promise(done => setTimeout(done, ms))
const send = (method, params = {}) => new Promise((done, fail) => {
  const id = ++serial, timer = setTimeout(() => { pending.delete(id); fail(Error(method)) }, 20000)
  pending.set(id, { done: value => { clearTimeout(timer); done(value) }, fail })
  socket.send(JSON.stringify({ id, method, params }))
})
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const waitFor = async expression => {
  const end = Date.now() + 20000
  while (Date.now() < end) {
    try { if (await evaluate(expression)) return } catch { /* new document */ }
    await pause()
  }
  throw Error(`Not ready: ${expression}`)
}
const navigate = async path => {
  await send('Page.navigate', { url: origin + path })
  await waitFor(`location.pathname === ${JSON.stringify(path.split('?')[0])} && document.readyState === 'complete'`)
}
const viewport = width => send('Emulation.setDeviceMetricsOverride', { width, height: width <= 430 ? (width === 320 ? 568 : width === 360 ? 640 : width === 390 ? 844 : 932) : width === 768 ? 1024 : 900, deviceScaleFactor: 1, mobile: false })
const screenshot = async name => {
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await writeFile(join(output, 'screenshots', name + '.jpg'), Buffer.from((await send('Page.captureScreenshot', { format: 'jpeg', quality: 78, captureBeyondViewport: false })).data, 'base64'))
}
const measure = async (page, scenario, boardSelector) => {
  const data = await evaluate(`(() => {
    const rect = element => { if (!element) return null; const r=element.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height),bottom:Math.round(r.bottom)} }
    const board=document.querySelector(${JSON.stringify(boardSelector)})
    const visible=element=>!!(element.offsetWidth||element.offsetHeight||element.getClientRects().length)&&getComputedStyle(element).visibility!=='hidden'
    const targets=[...document.querySelectorAll('button,a,input,select')].filter(visible).map(element=>({name:element.getAttribute('aria-label')||element.innerText||element.getAttribute('aria-labelledby')||element.tagName, ...rect(element), disabled:element.disabled||element.getAttribute('aria-disabled')==='true'}))
    const rules=document.querySelector('#how-to-play')
    return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,pageHeight:document.documentElement.scrollHeight,h1:document.querySelector('h1')?.innerText,h1Count:document.querySelectorAll('h1').length,mainCount:document.querySelectorAll('main').length,board:rect(board),rules:rect(rules),rulesWords:rules?.innerText.split(/\\s+/).length||0,intro:rect(document.querySelector('.zen-game-shell > p')),toolbar:rect(document.querySelector('.zen-game-toolbar')),firstCard:rect(document.querySelector('.zen-game-card')),cards:[...document.querySelectorAll('.zen-game-card')].map(element=>({name:element.innerText.split('\\n')[0],...rect(element)})),below44:targets.filter(t=>!t.disabled&&(t.width<44||t.height<44)),below24:targets.filter(t=>!t.disabled&&(t.width<24||t.height<24)),boardCell:rect(board?.querySelector('button')),continueLinks:targets.filter(t=>t.name.startsWith('Continue')),textSample:document.querySelector('.zen-game-shell > p')?.innerText}
  })()`)
  measurements.push({ page, scenario, ...data })
  assert.equal(data.h1Count, 1); assert.equal(data.mainCount, 1)
  return data
}
try {
  let port
  for (let i=0;i<150;i++) { try { port=Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]); break } catch { await pause() } }
  assert.ok(port)
  const target=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json()
  socket=new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((done,fail)=>{socket.onopen=done;socket.onerror=fail})
  socket.onmessage=({data})=>{
    const message=JSON.parse(data)
    if(message.method==='Runtime.exceptionThrown') errors.push(message.params.exceptionDetails)
    if(message.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(message.params.type)) warnings.push(message.params.args.map(arg=>arg.value??arg.description).join(' '))
    const entry=pending.get(message.id); if(!entry)return;pending.delete(message.id)
    if(message.error)entry.fail(Error(JSON.stringify(message.error)));else entry.done(message.result)
  }
  await send('Page.enable');await send('Runtime.enable');await send('Accessibility.enable')
  if (!conceptsOnly) {
  const pages=[{id:'home',path:'/',selector:'.zen-game-library'},...gameCases.map(game=>({...game,selector:game.id==='fifteen'?'.fifteen-board':game.selector}))]
  for(const page of pages){
    await viewport(390);await navigate(page.path)
    await waitFor(`history.state?.zenplayNavigationVersion===2 && !!document.querySelector(${JSON.stringify(page.selector)})`)
    for(const width of [320,360,390,430,768,1024,1440]){
      await viewport(width);await pause();await measure(page.id,'default',page.selector);await screenshot(`${page.id}-${width}`)
    }
    console.log(`Captured default ${page.id}: seven widths`)
  }
  // Same public origin, but fixture-only preferences in the newly created profile.
  for(const [scenario,settings] of [['light',{theme:'light'}],['accessible',{theme:'light',uiScale:'extra-large',gamePieceScale:'large',highContrast:true,simpleMode:true,reducedMotion:true}]]){
    await evaluate(`localStorage.setItem('zenplay-settings',JSON.stringify({version:5,settings:${JSON.stringify(settings)}}))`)
    for(const page of pages){
      await viewport(390);await navigate(page.path)
      await waitFor(`history.state?.zenplayNavigationVersion===2 && !!document.querySelector(${JSON.stringify(page.selector)})`)
      await pause();await measure(page.id,scenario,page.selector);await screenshot(`${page.id}-${scenario}-390`)
    }
  }
  // Native keyboard checks for each existing Help dialog; not spoken screen-reader testing.
  await evaluate(`localStorage.removeItem('zenplay-settings')`)
  for(const game of gameCases.filter(game=>!['flags','mahjong'].includes(game.id))){
    await viewport(390);await navigate(game.path);await waitFor(`!!document.querySelector(${JSON.stringify(game.selector)})`)
    const open=async label=>{
      await evaluate(`document.querySelectorAll('button').forEach(button=>{if(button.textContent.trim()===${JSON.stringify(label)})button.focus()})`)
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
    }
    if(game.id==='solitaire'){await open('Menu');await waitFor(`!!document.querySelector('[role="dialog"]')`);await open('How to Play')}
    else await open('Rules')
    await waitFor(`!!document.querySelector('[role="dialog"]')`)
    const initial=await evaluate(`({title:document.querySelector('[role="dialog"] h2').textContent,focusInside:document.querySelector('[role="dialog"]').contains(document.activeElement)})`)
    await screenshot(`${game.id}-help-390`)
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27})
    await waitFor(`!document.querySelector('[role="dialog"]')`)
    checks.push({game:game.id,...initial,restoredFocus:await evaluate(`document.activeElement.textContent.trim()`)})
  }
  await navigate('/games/flags/');await waitFor(`!!document.querySelector('.flags-setup')`)
  await evaluate(`[...document.querySelectorAll('button')].find(button=>button.textContent==='Start game').click()`)
  await waitFor(`!!document.querySelector('.flags-screen__choice')`)
  for(const width of [320,360,390,430,768,1024,1440]){await viewport(width);await pause();await measure('flags','active','.flags-flag-card');await screenshot(`flags-active-${width}`)}
  // No-JS DOM is inspected through the debugging protocol; page scripts remain disabled.
  await send('Emulation.setScriptExecutionDisabled',{value:true});await viewport(390)
  for(const page of pages){await navigate(page.path);const data=await evaluate(`({h1:document.querySelector('h1')?.textContent,rules:!!document.querySelector('#how-to-play'),noJs:document.body.innerText.includes('Playing games needs JavaScript'),links:document.querySelectorAll('a[href]').length})`);checks.push({page:page.id,noJavaScript:data});await screenshot(`${page.id}-nojs-390`)}
  await send('Emulation.setScriptExecutionDisabled',{value:false})
  }
  // Prototype is served only by this runner, outside the production build/route catalogue.
  for(const direction of ['lounge','studio','editorial']){
    for(const width of [390,1440]){await viewport(width);await navigate(`/__design-review/?direction=${direction}`);await waitFor(`document.documentElement.dataset.direction===${JSON.stringify(direction)}`);await screenshot(`concept-${direction}-${width}`)}
  }
  await viewport(390);await navigate('/__design-review/?direction=lounge&view=game');await screenshot('concept-game-390')
  await viewport(1440);await navigate('/__design-review/?direction=lounge&view=guides');await screenshot('concept-guides-1440')
  const conceptChecks=[]
  for (const width of [320,360,390,430,768,1024,1440]) {
    await viewport(width);await navigate('/__design-review/?direction=lounge')
    const geometry=await evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})`)
    assert.ok(geometry.scrollWidth<=geometry.width,'Concept page overflow')
    conceptChecks.push(geometry)
  }
  if (conceptsOnly) {
    await writeFile(join(output,'concept-results.json'),JSON.stringify({date:'2026-11-18',conceptChecks,errors,warnings},null,2)+'\n')
    assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);completed=true
    console.log('PASS refreshed eight concept screenshots and seven-width concept geometry')
  } else {
  const result={date:new Date().toISOString().slice(0,10),commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),browser:await send('Browser.getVersion'),viewportNote:'CSS pixels; desktop emulation, not physical devices; phone heights 568/640/844/932; tablet 1024; desktop 900',measurements,checks,errors,warnings}
  await writeFile(join(output,'results.json'),JSON.stringify(result,null,2)+'\n')
  assert.deepEqual(errors,[]);assert.deepEqual(warnings,[])
  completed = true
  console.log(JSON.stringify({measurements:measurements.length,checks:checks.length,errors,warnings,output}))
  }
}finally{
  if (!completed) await writeFile(join(output,'capture-checkpoint.json'),JSON.stringify({measurements,checks,errors,warnings},null,2)+'\n')
  socket?.close();browser.kill();await new Promise(done=>server.httpServer.close(done))
}
