import type { MouseEvent, ReactNode } from 'react'
import { gameCatalogue, type GameSummary } from '../app/gameCatalogue'
import { shouldHandleLinkClick, type AppNavigation } from '../app/navigation'
import { GameCard } from '../components/GameCard'
import { GameShell } from '../components/GameShell'
import { solitaireContent } from './publicContent'

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
    {actions}
  </header>
  <div className="zen-game-library grid grid-cols-1 gap-4 sm:grid-cols-2">
    {gameCatalogue.filter((game) => game.status === 'available').map((game) => <GameCard key={game.id} game={game}
      href={game.id === 'solitaire' ? game.target : undefined}
      canContinue={continueAvailability[game.id] ?? false}
      onSelect={onSelect ? (event) => onSelect(game, event) : undefined}
      onContinue={onSelect ? (event) => onSelect(game, event) : undefined}
    />)}
  </div>
</>

export const GameLoading = () => <p className="my-3 text-lg" role="status" aria-live="polite">Loading game…</p>

export const SolitairePage = ({ onBack, children = <GameLoading /> }: { onBack?: () => void; children?: ReactNode }) => <GameShell title="Solitaire" onBack={onBack} compactBack>
  <p className="text-base">{solitaireContent.introduction} <a href="#how-to-play" className="underline">How to play</a></p>
  <section aria-label="Solitaire game">{children}</section>
  <section id="how-to-play" aria-labelledby="solitaire-rules-title" className="mt-8 space-y-3 text-base leading-relaxed">
    <h2 id="solitaire-rules-title" className="text-xl font-semibold">How to play Solitaire</h2>
    {solitaireContent.rules.map(({ heading, text }) => <section key={heading}>
      <h3 className="font-bold">{heading}</h3><p>{text}</p>
    </section>)}
    <a href="/" onClick={onBack ? (event) => {
      if (shouldHandleLinkClick(event)) { event.preventDefault(); onBack() }
    } : undefined} className="underline">Back to the game library</a>
  </section>
</GameShell>

export const NotFoundPage = () => <section className="space-y-4">
  <h1 data-screen-heading tabIndex={-1} className="text-2xl font-semibold">Page not found</h1>
  <p>This page is not available.</p>
  <a href="/" className="zen-game-button">Back to Games</a>
</section>

// The renderer never imports the browser application, providers or game engines.
export const PublicShell = ({ navigation }: { navigation: AppNavigation }) => <AppFrame solitaire={navigation.screen === 'game' && navigation.gameId === 'solitaire'}>
  {navigation.screen === 'home' ? <HomePage /> : navigation.screen === 'game' && navigation.gameId === 'solitaire' ? <SolitairePage /> : <NotFoundPage />}
</AppFrame>
