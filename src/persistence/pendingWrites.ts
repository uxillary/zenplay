// Keep queued snapshots alive across in-document screen changes. This changes
// read ordering only; game IDs, serializers and stored envelopes are unchanged.
const pendingWrites = new Map<string, Promise<void>>()

export const trackGameWrites = (gameId: string, writes: Promise<void>): void => {
  pendingWrites.set(gameId, writes.catch(() => undefined))
}

export const waitForGameWrites = async (gameId: string): Promise<void> => { await pendingWrites.get(gameId) }
