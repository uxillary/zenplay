import { appPathForNavigation, utilityRoutes, type AppNavigation } from '../app/navigation.ts'
import { gameCatalogue, type GameId } from '../app/gameCatalogue.ts'

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

export const gameContent = {
  solitaire: { ...solitaireContent, heading: 'Solitaire', title: publicPages.solitaire.title, description: publicPages.solitaire.description, related: ['mahjong', 'sudoku'] },
  sudoku: {
    heading: 'Sudoku', title: 'Free Sudoku, No Adverts — ZenPlay',
    description: 'Play free Sudoku with easy, medium and hard puzzles, notes, undo and hints. Clear controls, local saves and no account required.',
    introduction: 'Fill a familiar 9 × 9 number grid, with notes and hints when you want them.',
    rules: [
      { heading: 'Goal', text: 'Every row, column and 3 × 3 box must contain each number from 1 to 9 once. The given numbers cannot be changed.' },
      { heading: 'Controls', text: 'Select an empty square, then choose a number or press its number key. Arrow keys move the selection. Notes toggles small candidate numbers. Erase clears an entry or notes, and Undo reverses your last change.' },
      { heading: 'Puzzle choices', text: 'Choose Easy, Medium or Hard when starting a new puzzle. Hint fills an unsolved square. Show mistakes is optional.' },
    ], related: ['word-search', 'fifteen'],
  },
  pairs: {
    heading: 'Pairs', title: 'Free Pairs Matching Game — ZenPlay',
    description: 'Find matching cards in free Pairs. Choose 6, 8 or 12 pairs, use a gentle hint and resume locally. No adverts or account required.',
    introduction: 'Turn over cards and find their matching partners at your own pace.',
    rules: [
      { heading: 'Goal', text: 'Turn over two cards at a time. Matching cards stay face up. Non-matching cards turn back over after a short look. Find every pair to finish.' },
      { heading: 'Controls', text: 'Tap a face-down card, or use Tab and Enter or Space. A turn consists of two cards. Hint briefly reveals one unmatched card before it turns face down again.' },
      { heading: 'Board size', text: 'Choose Easy for 6 pairs, Standard for 8 pairs, or More for 12 pairs when starting a new game.' },
    ], related: ['mahjong', 'flags'],
  },
  'word-search': {
    heading: 'Word Search', title: 'Free Word Search, No Adverts — ZenPlay',
    description: 'Find words in themed Word Search puzzles. Tap endpoints or drag, use keyboard controls and hints, and resume on this device. Free with no adverts.',
    introduction: 'Find the listed words in a themed letter grid, using taps, dragging or a keyboard.',
    rules: [
      { heading: 'Goal', text: 'Find every listed word. Words run in straight lines horizontally, vertically or diagonally; some run backwards.' },
      { heading: 'Controls', text: 'Tap the first letter and then the last letter, or drag along a word. Arrow keys move through the grid; Enter or Space chooses an endpoint. Escape clears your selection.' },
      { heading: 'Puzzle choices and hints', text: 'New Puzzle lets you choose a theme and puzzle. Hint shows the first letter of an unfound word. Found words are marked in the list and grid.' },
    ], related: ['sudoku', 'pairs'],
  },
  'noughts-crosses': {
    heading: 'Noughts & Crosses', title: 'Free Noughts & Crosses — ZenPlay',
    description: 'Play Noughts & Crosses, also called Tic-Tac-Toe, against the computer or with two players sharing a device. Free, clear and ad-free.',
    introduction: 'Play a familiar game of Noughts & Crosses, also known as Tic-Tac-Toe.',
    rules: [
      { heading: 'Goal', text: 'Take turns placing a mark in an empty square. Three matching marks across, down or diagonally win. A full board without a winner is a draw.' },
      { heading: 'Players and controls', text: 'Choose Two Players to share this device, or Play Computer for a local opponent. Tap an empty square, or use Tab and Enter or Space to place a mark.' },
      { heading: 'Rounds', text: 'New Round starts another board. This game does not save an unfinished round when you leave it.' },
    ], related: ['fifteen', 'flags'],
  },
  fifteen: {
    heading: 'Fifteen Puzzle', title: 'Free Fifteen Puzzle — ZenPlay',
    description: 'Slide numbered tiles into order in the classic Fifteen Puzzle. Clear controls, solvable new puzzles and local resume. Free with no adverts.',
    introduction: 'Slide the numbered tiles into order in this classic 4 × 4 puzzle.',
    rules: [
      { heading: 'Goal', text: 'Arrange the tiles from 1 to 15, reading across each row, with the empty space in the bottom-right corner. Every new puzzle can be solved.' },
      { heading: 'Controls', text: 'Only a tile directly beside the empty space can move. Tap a numbered tile to slide it, or use Tab to focus it and Enter or Space to move it. The empty space cannot be moved directly.' },
      { heading: 'New puzzles', text: 'New Puzzle replaces the current arrangement after confirmation when you have made progress.' },
    ], related: ['sudoku', 'noughts-crosses'],
  },
  mahjong: {
    heading: 'Mahjong Solitaire', title: 'Free Mahjong Solitaire, No Adverts — ZenPlay',
    description: 'Match free tiles on a layered Classic Turtle Mahjong Solitaire board. Use undo, tile labels and keyboard controls. Free with local saves and no adverts.',
    introduction: 'Clear a layered Classic Turtle board in this single-player tile-matching Mahjong Solitaire game.',
    rules: [
      { heading: 'Goal', text: 'Remove all 144 tiles in matching pairs. This is Mahjong Solitaire, rather than the traditional multiplayer Mahjong game.' },
      { heading: 'Free tiles and matches', text: 'A tile is free when no tile covers it and at least one long side is open. Match identical suited tiles, winds or dragons. Any flower matches another flower, and any season matches another season.' },
      { heading: 'Controls', text: 'Select two free matching tiles to remove them. Arrow keys move between free tiles; Enter or Space selects one. Tile labels can help identify faces. Undo restores the last removed pair. If there are no matches, undo or start a new game.' },
      { heading: 'Hints', text: 'Hints highlight an available pair when you have free hints remaining. Clearing board layers earns additional free hints.' },
    ], related: ['solitaire', 'pairs'],
  },
  flags: {
    heading: 'Flags Quiz', title: 'Free Flags Quiz — ZenPlay',
    description: 'Recognise flags in Classic, Practice or Reverse mode. Choose all countries or a region, review answers and learn at your own pace. Free and ad-free.',
    introduction: 'Recognise flags and countries in a calm quiz, with a choice of modes and regions.',
    rules: [
      { heading: 'Choose a mode', text: 'Classic shows a flag and asks for its country. Reverse names a country and asks for its flag. Practice helps you learn flags and retry missed answers.' },
      { heading: 'Controls and rounds', text: 'Choose all countries or a region, then Start game. Select an answer using touch or Tab and Enter or Space. Review the feedback, then continue. Classic and Reverse have ten questions.' },
      { heading: 'Practice', text: 'Practice begins with ten countries and brings missed flags back after other questions. An unfinished quiz is not saved when you leave this page.' },
    ], related: ['pairs', 'noughts-crosses'],
  },
} satisfies Record<GameId, { heading: string; title: string; description: string; introduction: string; rules: { heading: string; text: string }[]; related: GameId[] }>

export const metadataForNavigation = (navigation: AppNavigation): PageMetadata => {
  if (navigation.screen === 'home') return publicPages.home
  const game = gameCatalogue.find((entry) => navigation.screen === 'game' && entry.id === navigation.gameId)
  if (game) return { ...gameContent[game.id], canonical: `${canonicalOrigin}${game.target}`, noindex: false }
  const utility = utilityRoutes.find(({ screen }) => screen === navigation.screen)
  if (utility) return { title: `${utility.heading} — ZenPlay`, description: utility.description, canonical: `${canonicalOrigin}${utility.path}`, noindex: true }
  return publicPages.notFound
}

export const socialImage = { url: `${canonicalOrigin}/icons/icon-512.png`, width: 512, height: 512, alt: 'ZenPlay: a cream Z on a deep green background' }

export const structuredDataForNavigation = (navigation: AppNavigation): Record<string, unknown> | null => {
  const page = metadataForNavigation(navigation)
  if (page.noindex) return null
  const website = { '@type': 'WebSite', '@id': `${canonicalOrigin}/#website`, url: `${canonicalOrigin}/`, name: 'ZenPlay', inLanguage: 'en' }
  if (navigation.screen === 'home') return { '@context': 'https://schema.org', '@graph': [website, {
    '@type': 'CollectionPage', '@id': `${canonicalOrigin}/#page`, url: page.canonical, name: page.title, description: page.description, isPartOf: { '@id': website['@id'] },
    mainEntity: { '@type': 'ItemList', itemListElement: gameCatalogue.map((game, index) => ({ '@type': 'ListItem', position: index + 1, name: gameContent[game.id].heading, url: `${canonicalOrigin}${game.target}` })) },
  }] }
  const url = `${canonicalOrigin}${appPathForNavigation(navigation)}`
  return { '@context': 'https://schema.org', '@graph': [website,
    { '@type': 'WebPage', '@id': `${url}#page`, url, name: page.title, description: page.description, isPartOf: { '@id': website['@id'] }, mainEntity: { '@id': `${url}#game` } },
    { '@type': 'VideoGame', '@id': `${url}#game`, url, name: gameContent[navigation.gameId as GameId].heading, description: page.description, inLanguage: 'en', isAccessibleForFree: true, gamePlatform: 'Web browser' },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${canonicalOrigin}/` }, { '@type': 'ListItem', position: 2, name: gameContent[navigation.gameId as GameId].heading, item: url }] },
  ] }
}

export const serializeStructuredData = (data: Record<string, unknown>): string => JSON.stringify(data).replace(/</g, '\\u003c')

export const metadataTags = (page: PageMetadata, noindex = page.noindex): { attribute: 'name' | 'property'; key: string; content: string }[] => [
  { attribute: 'name', key: 'description', content: page.description },
  { attribute: 'name', key: 'robots', content: noindex ? 'noindex,follow' : 'index,follow' },
  ...Object.entries({ 'og:type': 'website', 'og:site_name': 'ZenPlay', 'og:title': page.title, 'og:description': page.description,
    ...(page.canonical ? { 'og:url': page.canonical } : {}), 'og:image': socialImage.url, 'og:image:type': 'image/png',
    'og:image:width': String(socialImage.width), 'og:image:height': String(socialImage.height), 'og:image:alt': socialImage.alt,
  }).map(([key, content]) => ({ attribute: 'property' as const, key, content })),
  ...Object.entries({ 'twitter:card': 'summary', 'twitter:title': page.title, 'twitter:description': page.description, 'twitter:image': socialImage.url, 'twitter:image:alt': socialImage.alt })
    .map(([key, content]) => ({ attribute: 'name' as const, key, content })),
]
