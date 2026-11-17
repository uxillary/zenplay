import type { MouseEvent, ReactNode } from 'react'
import { gameCatalogue, type GameSummary, type GameId } from '../app/gameCatalogue'
import { shouldHandleLinkClick, utilityRoutes, type AppNavigation } from '../app/navigation'
import { GameCard } from '../components/GameCard'
import { GameShell } from '../components/GameShell'
import { gameContent } from './publicContent'

export const AppFrame = ({ solitaire = false, children }: { solitaire?: boolean; children: ReactNode }) => <>
  <a href="#main-content" onClick={(event) => {
    if (!shouldHandleLinkClick(event)) return
    event.preventDefault()
    // Keep root history-state screens intact when skipping within this page.
    const main = event.currentTarget.nextElementSibling as HTMLElement | null
    main?.focus()
    main?.scrollIntoView()
  }} className="sr-only focus:not-sr-only focus:absolute focus:z-50 zen-game-button">Skip to content</a>
  <main id="main-content" tabIndex={-1} className={`zen-app-frame min-h-[100dvh] overflow-x-hidden p-3 md:p-6 ${solitaire ? 'zen-app-frame--solitaire' : ''}`}>
    <div className={`zen-app-panel mx-auto min-h-[calc(100dvh-1.5rem)] max-w-7xl p-4 md:min-h-[calc(100dvh-3rem)] md:p-8 ${solitaire ? 'zen-app-panel--solitaire' : ''}`}>
      {children}
    </div>
  </main>
</>

export const HomePage = ({ actions, continueAvailability = {}, onSelect }: {
  actions?: ReactNode
  continueAvailability?: Record<string, boolean>
  onSelect?: (game: GameSummary, event: MouseEvent<HTMLElement>) => void
}) => <>
  <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
    <div>
      <p className="zen-wordmark">ZenPlay</p>
      <h1 data-screen-heading tabIndex={-1} className="zen-home-title mt-2">Choose a game</h1>
      <p className="mt-2 text-lg">Classic games. Easy to see. Easy to understand. No adverts. No online account needed.</p>
    </div>
    {actions ?? <nav aria-label="ZenPlay options" className="flex flex-wrap gap-2">{utilityRoutes.filter(route => route.screen !== 'support').map(route => <a key={route.path} href={route.path} className="zen-game-button">{route.heading}</a>)}</nav>}
  </header>
  <div className="zen-game-library grid grid-cols-1 gap-4 sm:grid-cols-2">
    {gameCatalogue.filter((game) => game.status === 'available').map((game) => <GameCard key={game.id} game={game}
      href={game.target}
      canContinue={continueAvailability[game.id] ?? false}
      onSelect={onSelect ? (event) => onSelect(game, event) : undefined}
      onContinue={onSelect ? (event) => onSelect(game, event) : undefined}
    />)}
  </div>
</>

export const GameLoading = () => <p className="my-3 text-lg" role="status" aria-live="polite">Loading game…</p>

export const PublicGamePage = ({ gameId, onBack, onGameNavigate, children = <GameLoading /> }: {
  gameId: GameId
  onBack?: () => void
  onGameNavigate?: (id: GameId) => void
  children?: ReactNode
}) => {
  const content = gameContent[gameId]
  const game = gameCatalogue.find(entry => entry.id === gameId)!
  return <GameShell title={content.heading} onBack={onBack} compactBack={gameId === 'solitaire'}>
    <p className="text-base">{content.introduction} <a href="#how-to-play" className="underline">How to play</a></p>
    <section aria-label={`${content.heading} game`}>{children}</section>
    <section id="how-to-play" aria-labelledby="game-rules-title" className="mt-8 space-y-3 text-base leading-relaxed">
      <h2 id="game-rules-title" className="text-xl font-semibold">How to play {content.heading}</h2>
      {content.rules.map(({ heading, text }) => <section key={heading}><h3 className="font-bold">{heading}</h3><p>{text}</p></section>)}
      {game.supportsContinue && gameId !== 'solitaire' ? <p>Your unfinished game is saved on this device when browser storage is available. Choose Continue {game.name} in the library to resume. Play offline after ZenPlay is ready for offline use.</p> : null}
      <nav aria-label="Related games" className="flex flex-wrap gap-4">
        <a href="/" onClick={onBack ? event => { if (shouldHandleLinkClick(event)) { event.preventDefault(); onBack() } } : undefined} className="underline">Game library</a>
        {content.related.map(id => <a key={id} href={gameCatalogue.find(entry => entry.id === id)!.target} className="underline" onClick={onGameNavigate ? event => {
          if (shouldHandleLinkClick(event)) { event.preventDefault(); onGameNavigate(id) }
        } : undefined}>{gameContent[id].heading}</a>)}
      </nav>
    </section>
  </GameShell>
}

export const UtilityShell = ({ screen }: { screen: string }) => {
  const route = utilityRoutes.find(entry => entry.screen === screen)!
  return <section className="mx-auto max-w-2xl space-y-4">
    <a href="/" className="zen-game-button zen-game-button--back">Back to Games</a>
    <h1 data-screen-heading tabIndex={-1} className="text-2xl font-semibold">{route.heading}</h1>
    <p>{route.description}</p>
    <p role="status" aria-live="polite">Loading {route.heading}…</p>
  </section>
}

export const NotFoundPage = () => <section className="space-y-4">
  <h1 data-screen-heading tabIndex={-1} className="text-2xl font-semibold">Page not found</h1>
  <p>This page is not available.</p>
  <a href="/" className="zen-game-button">Back to Games</a>
</section>

// The renderer never imports the browser application, providers or game engines.
export const PublicShell = ({ navigation }: { navigation: AppNavigation }) => {
  const game = gameCatalogue.find(entry => navigation.screen === 'game' && entry.id === navigation.gameId)
  return <AppFrame solitaire={game?.id === 'solitaire'}>
    {navigation.screen === 'home' ? <HomePage /> : game ? <PublicGamePage gameId={game.id} />
      : utilityRoutes.some(route => route.screen === navigation.screen) ? <UtilityShell screen={navigation.screen} /> : <NotFoundPage />}
  </AppFrame>
}
