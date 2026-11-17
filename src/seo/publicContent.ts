import type { AppNavigation } from '../app/navigation.ts'
import { gameCatalogue } from '../app/gameCatalogue.ts'

export const canonicalOrigin = 'https://playadfree.games'

export type PageMetadata = { title: string; description: string; canonical: string | null; noindex: boolean }

export const publicPages = {
  home: {
    title: 'Free Classic Games, No Adverts — ZenPlay',
    description: 'Play familiar games with clear controls, no adverts and no account required. Choose Solitaire, Sudoku, Pairs and more. Play offline after ZenPlay is ready.',
    canonical: `${canonicalOrigin}/`,
    noindex: false,
  },
  solitaire: {
    title: 'Free Solitaire, No Adverts — ZenPlay',
    description: 'Play free Klondike Solitaire with no adverts. Use tap or keyboard controls, draw one or three cards, and resume your saved game on this device. No account required.',
    canonical: `${canonicalOrigin}/games/solitaire/`,
    noindex: false,
  },
  notFound: {
    title: 'Page not found — ZenPlay',
    description: 'This page is not available. Return to the ZenPlay game library.',
    canonical: null,
    noindex: true,
  },
} satisfies Record<string, PageMetadata>

export const solitaireContent = {
  introduction: 'Play Klondike Solitaire with a standard 52-card deck. No adverts and no account required.',
  rules: [
    { heading: 'Goal', text: 'Move all 52 cards to the four foundations, building each suit from Ace to King.' },
    { heading: 'Tableau', text: 'Build columns down in alternating red and black. Move a face-up card or a correctly ordered face-up stack. Only a King may start an empty column.' },
    { heading: 'Foundations', text: 'Build each foundation up by suit, starting with an Ace. Any Ace may start any empty foundation.' },
    { heading: 'Stock and waste', text: 'Choose Draw 1 or Draw 3 in Game Options. Select the stock to draw cards. When it is empty, select it again to turn the waste back over.' },
    { heading: 'Controls', text: 'Tap a face-up card or stack, then its destination. You can also drag it. With a keyboard, use Tab to reach a card or pile and Enter or Space to select it and a destination. Select it again to cancel. Double-tap a suitable card to send it to a foundation. Use Undo to take back a move or stock action.' },
    { heading: 'Continue playing', text: 'Your game is saved on this device automatically when browser storage is available. Return to the library and choose Continue Solitaire to resume. Play offline once ZenPlay is ready for offline use.' },
  ],
}

export const metadataForNavigation = (navigation: AppNavigation): PageMetadata => {
  if (navigation.screen === 'home') return publicPages.home
  if (navigation.screen === 'game' && navigation.gameId === 'solitaire') return publicPages.solitaire
  if (navigation.screen === 'not-found') return publicPages.notFound
  const game = gameCatalogue.find((entry) => entry.id === navigation.gameId)
  const name = game?.name ?? ({ settings: 'Settings', profile: 'Profile', support: 'Support ZenPlay', install: 'Install ZenPlay' } as Partial<Record<string, string>>)[navigation.screen] ?? 'ZenPlay'
  return { title: `${name} — ZenPlay`, description: game?.description ?? 'Familiar games. No adverts. Accounts are optional.', canonical: null, noindex: true }
}
