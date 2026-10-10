import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { COUNTRIES } from './countries.ts'
import { FLAG_MEMORY_HOOK_CATEGORIES, FLAG_MEMORY_HOOKS, getFlagMemoryHook } from './memoryHooks.ts'
import test from 'node:test'

const countryIds = new Set(COUNTRIES.map(({ id }) => id))

const previousCountryIds = [
  'jp', 'al', 'np', 'fj', 'zm', 'ca', 'br', 'kr', 'in', 'ch', 'jm', 'bt', 'za', 'gb', 'gr', 'mx', 'sa', 'kz', 'ar', 'sc',
  'fr', 'de', 'it', 'es', 'pt', 'cz', 'no', 'se', 'dk', 'fi', 'pl', 'ua', 'cn', 'pk', 'bd', 'lk', 'th', 'vn', 'id', 'my',
  'sg', 'ph', 'tr', 'ke', 'ng', 'gh', 'et', 'ma', 'eg', 'ug', 'tz', 'us', 'cl', 'co', 'pe', 'uy', 'cu', 'bb', 'bs', 'ni',
  'au', 'nz', 'pg', 'ws', 'to',
]
const previousC2CountryIds = [
  'bw', 'na', 'ls', 'sz', 'mw', 'mz', 'ao', 'dz', 'tn', 'sn', 'ml', 'ne', 'cm', 'ci', 'bf', 'bj', 'tg', 'lr', 'sl', 'rw', 'bi', 'cd', 'mg',
  'kh', 'la', 'mn', 'mm', 'bn', 'ir', 'iq', 'il', 'jo', 'kw', 'lb', 'om', 'qa', 'ae', 'ye', 'mv', 'kg',
  'at', 'is', 'hr', 'ro', 'rs', 'ru', 'si', 'sk', 'be', 'nl',
  'bo', 'ec', 'pa', 'cr', 'hn', 'sv', 'gt', 'py', 'tt', 'bz',
  'ki', 'fm', 'pw', 'sb', 'vu',
]
const previousHookIds = [...previousCountryIds, ...previousC2CountryIds]

test('the expanded library retains the previous 130 and adds 64 unique canonical IDs', () => {
  assert.equal(FLAG_MEMORY_HOOKS.length, 194)
  assert.equal(new Set(FLAG_MEMORY_HOOKS.map(({ countryId }) => countryId)).size, FLAG_MEMORY_HOOKS.length)
  assert.ok(FLAG_MEMORY_HOOKS.every(({ countryId }) => countryIds.has(countryId)))
  for (const id of previousHookIds) assert.ok(getFlagMemoryHook(id), `retains ${id}`)
  assert.equal(FLAG_MEMORY_HOOKS.length - previousHookIds.length, 64)
  for (const entry of FLAG_MEMORY_HOOKS.slice(previousHookIds.length)) {
    const wordCount = entry.hook.trim().split(/\s+/).length
    assert.ok(wordCount >= 10 && wordCount <= 25, `${entry.countryId} has ${wordCount} words`)
  }
})

test('hooks have valid categories, concise plain text, and well-formed source references', () => {
  const categories = new Set<string>()
  for (const entry of FLAG_MEMORY_HOOKS) {
    assert.ok(FLAG_MEMORY_HOOK_CATEGORIES.includes(entry.category))
    categories.add(entry.category)
    assert.ok(entry.hook.trim().length > 0)
    assert.ok(entry.hook.split(/\s+/).length >= 8 && entry.hook.split(/\s+/).length <= 25, entry.countryId)
    assert.equal(entry.hook.trim(), entry.hook)
    assert.ok(!/[<>]|\p{Extended_Pictographic}/u.test(entry.hook), `${entry.countryId} hook is plain text`)
    assert.ok(entry.sources.length > 0)
    for (const source of entry.sources) {
      assert.ok(source.title.trim().length > 0)
      const url = new URL(source.url)
      assert.equal(url.protocol, 'https:')
      assert.ok(['www.fotw.info', 'www.gov.br', 'knowindia.india.gov.in', 'my.gov.sa', 'www.nationalarchives.gov.uk', 'www.gov.ie', 'govcms.gov.mt', 'presidencia.st', 'sana.sy', 'www.refworld.org', 'cbd.minjust.gov.kg', 'prg.kz'].includes(url.hostname))
      assert.ok(url.pathname.length > 1)
    }
    if (entry.explanation !== undefined) {
      assert.ok(entry.explanation.trim().length > 0)
      assert.ok(!/[<>]|\p{Extended_Pictographic}/u.test(entry.explanation))
    }
  }
  assert.equal(new Set(FLAG_MEMORY_HOOKS.map(({ hook }) => hook.toLocaleLowerCase('en-GB'))).size, FLAG_MEMORY_HOOKS.length)
  assert.ok(FLAG_MEMORY_HOOKS.every(({ hook }) => !/^(todo|tbd|placeholder)\b/i.test(hook)))
  assert.deepEqual([...categories].sort(), [...FLAG_MEMORY_HOOK_CATEGORIES].sort())
})

test('comparison country references resolve to canonical countries', () => {
  const comparisons = FLAG_MEMORY_HOOKS.filter(({ relatedCountryIds }) => relatedCountryIds)
  assert.ok(comparisons.length > 0)
  for (const entry of comparisons) {
    assert.equal(entry.category, 'comparison')
    assert.ok((entry.relatedCountryIds?.length ?? 0) > 0)
    for (const countryId of entry.relatedCountryIds ?? []) assert.ok(countryIds.has(countryId))
  }
})

test('lookup returns reviewed content and safely omits disputed or unknown countries', () => {
  assert.equal(getFlagMemoryHook('jp'), FLAG_MEMORY_HOOKS[0])
  assert.equal(getFlagMemoryHook('af'), undefined)
  assert.equal(getFlagMemoryHook('sy')?.hook, 'Syria’s green, white, and black bands carry three red five-pointed stars in a straight row.')
  assert.equal(getFlagMemoryHook('kg')?.hook, 'Kyrgyzstan’s straight golden sun rays surround the red crossed bars of a tunduk on a red field.')
  assert.equal(getFlagMemoryHook('unknown'), undefined)
})

test('coverage report is deterministic, reaches 194 of 195, and accounts for all five regions', () => {
  const canonicalCount = COUNTRIES.length
  const hookIds = new Set(FLAG_MEMORY_HOOKS.map(({ countryId }) => countryId))
  const hooked = COUNTRIES.filter(({ id }) => hookIds.has(id))
  const byRegion = Object.fromEntries(['Europe', 'Asia', 'Africa', 'Americas', 'Oceania'].map((region) => [
    region,
    {
      total: COUNTRIES.filter((country) => country.region === region).length,
      withHooks: hooked.filter((country) => country.region === region).length,
    },
  ]))
  const withoutHooks = canonicalCount - hooked.length
  const coveragePercent = Number((hooked.length / canonicalCount * 100).toFixed(2))

  assert.equal(canonicalCount, 195)
  assert.equal(hooked.length, 194)
  assert.equal(withoutHooks, 1)
  assert.equal(coveragePercent, 99.49)
  assert.deepEqual(byRegion, {
    Europe: { total: 44, withHooks: 44 },
    Asia: { total: 48, withHooks: 47 },
    Africa: { total: 54, withHooks: 54 },
    Americas: { total: 35, withHooks: 35 },
    Oceania: { total: 14, withHooks: 14 },
  })
  assert.deepEqual(COUNTRIES.filter(({ id }) => !hookIds.has(id)).map(({ id }) => id).sort(), ['af'])
  assert.deepEqual(
    Object.fromEntries(FLAG_MEMORY_HOOK_CATEGORIES.map((category) => [category, FLAG_MEMORY_HOOKS.filter((entry) => entry.category === category).length])),
    { visual: 138, symbol: 42, comparison: 13, country: 1 },
  )
})

test('the question engine does not consume learning content or bias round selection', () => {
  const screen = readFileSync(new URL('../ui/FlagsScreen.tsx', import.meta.url), 'utf8')
  const engine = readFileSync(new URL('./engine.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(engine, /memoryHooks|getFlagMemoryHook/)
  assert.match(screen, /getFlagMemoryHook\(feedback\.answer\.id\)/)
  assert.match(screen, /learningHook && feedback/)
})

test('adding local hooks does not bias or alter question generation', () => {
  const engine = readFileSync(new URL('./engine.ts', import.meta.url), 'utf8')
  assert.match(engine, /export const createFlagRound = \(random: RandomSource = Math\.random, countries: readonly Country\[\] = COUNTRIES\)/)
  assert.doesNotMatch(engine, /FLAG_MEMORY_HOOKS|getFlagMemoryHook/)
})
