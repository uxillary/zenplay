import { useRef, useState, type FormEvent } from 'react'
import type { GameDefinition } from '../app/gameRegistry'
import {
  createLocalProfile,
  deleteLocalProfile,
  editLocalProfile,
  loadLocalProfile,
  ProfileValidationError,
  type LocalProfile,
} from '../lib/localProfile'
import { GameDialog } from './GameDialog'

type Props = { games: readonly GameDefinition[] }

export const ProfilePanel = ({ games }: Props) => {
  const [profile, setProfile] = useState<LocalProfile | null>(() => loadLocalProfile())
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [favouriteGameId, setFavouriteGameId] = useState(profile?.favouriteGameId ?? '')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  const focusWhenReady = (target: 'create' | 'summary') => {
    window.requestAnimationFrame(() => (target === 'create' ? createButtonRef.current : summaryRef.current)?.focus())
  }

  const startEditing = () => {
    setDisplayName(profile?.displayName ?? '')
    setFavouriteGameId(profile?.favouriteGameId ?? '')
    setError('')
    setStatus('')
    setEditing(true)
  }

  const cancelEditing = () => {
    setError('')
    setEditing(false)
    if (!profile) focusWhenReady('create')
  }

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setStatus('')
    try {
      const input = { displayName, favouriteGameId: favouriteGameId || null }
      const saved = profile ? editLocalProfile(profile, input) : createLocalProfile(input)
      if (!saved) {
        setError('Your profile could not be saved on this device. Check your device storage and try again.')
        return
      }
      setProfile(saved)
      setEditing(false)
      setStatus(profile ? 'Profile updated.' : 'Profile created on this device.')
      focusWhenReady('summary')
    } catch (cause) {
      setError(cause instanceof ProfileValidationError ? cause.message : 'Your profile could not be saved. Please try again.')
    }
  }

  const removeProfile = () => {
    if (!deleteLocalProfile()) {
      setError('Your profile could not be removed from this device. Please try again.')
      setConfirmDelete(false)
      return
    }
    setProfile(null)
    setEditing(false)
    setDisplayName('')
    setFavouriteGameId('')
    setError('')
    setStatus('Local profile removed. Your game saves and settings are unchanged.')
    setConfirmDelete(false)
    focusWhenReady('create')
  }

  const favouriteGame = games.find((game) => game.id === profile?.favouriteGameId)

  return (
    <section className="mx-auto max-w-2xl space-y-5 p-4 md:p-6" aria-labelledby="profile-title">
      <h1 id="profile-title" data-screen-heading tabIndex={-1} className="text-2xl font-semibold">Profile</h1>
      <p className="text-lg leading-relaxed">A profile is optional. Your games, saved games, settings and accessibility work without one. This profile stays on this device and is private.</p>

      {status ? <p role="status" aria-live="polite">{status}</p> : null}
      {error ? <p id="profile-error" role="alert" className="rounded-lg border border-amber-700 p-3">{error}</p> : null}

      {!profile && !editing ? (
        <div className="space-y-4">
          <p>You do not have a profile on this device.</p>
          <button ref={createButtonRef} type="button" onClick={startEditing} className="zen-game-button zen-game-button--primary">Create a profile</button>
        </div>
      ) : null}

      {profile && !editing ? (
        <div ref={summaryRef} tabIndex={-1} className="space-y-4 rounded-xl border border-zinc-400/70 p-4">
          <h2 className="text-xl font-semibold">{profile.displayName}</h2>
          <dl className="space-y-2">
            <div><dt className="font-semibold">Favourite game</dt><dd>{profile.favouriteGameId ? favouriteGame?.name ?? 'A game that is no longer available' : 'Not set'}</dd></div>
            <div><dt className="font-semibold">Profile visibility</dt><dd>Private on this device</dd></div>
            <div><dt className="font-semibold">Created</dt><dd><time dateTime={profile.createdAt}>{new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(profile.createdAt))}</time></dd></div>
          </dl>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={startEditing} className="zen-game-button">Edit profile</button>
            <button type="button" onClick={() => { setError(''); setConfirmDelete(true) }} className="zen-game-button border border-red-700">Remove local profile</button>
          </div>
        </div>
      ) : null}

      {editing ? (
        <form className="space-y-4" onSubmit={saveProfile} aria-describedby={error ? 'profile-error' : undefined}>
          <div className="space-y-2">
            <label htmlFor="profile-display-name" className="block font-semibold">Display name</label>
            <input
              id="profile-display-name"
              name="displayName"
              autoComplete="nickname"
              required
              minLength={2}
              maxLength={32}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-lg border border-current bg-transparent p-3"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'profile-error profile-name-help' : 'profile-name-help'}
            />
            <p id="profile-name-help" className="text-sm">Use 2 to 32 characters. This name is only stored on this device.</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-favourite-game" className="block font-semibold">Favourite game (optional)</label>
            <select
              id="profile-favourite-game"
              name="favouriteGameId"
              value={favouriteGameId}
              onChange={(event) => setFavouriteGameId(event.target.value)}
              className="w-full rounded-lg border border-current bg-transparent p-3"
            >
              <option value="">No favourite selected</option>
              {favouriteGameId && !games.some((game) => game.id === favouriteGameId) ? <option value={favouriteGameId}>Unavailable game</option> : null}
              {games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
            </select>
          </div>
          <p className="text-base">Your profile is private and stored locally. It does not affect game saves or settings.</p>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="zen-game-button zen-game-button--primary">Save profile</button>
            <button type="button" onClick={cancelEditing} className="zen-game-button">Cancel</button>
          </div>
        </form>
      ) : null}

      {confirmDelete ? <GameDialog
        alert
        title="Remove local profile?"
        description="This removes the profile from this device. Your game saves, statistics and settings will stay here. There is no online profile to delete."
        onDismiss={() => setConfirmDelete(false)}
      >
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={removeProfile} className="zen-game-button border border-red-700">Remove profile</button>
          <button type="button" onClick={() => setConfirmDelete(false)} className="zen-game-button">Keep profile</button>
        </div>
      </GameDialog> : null}
    </section>
  )
}
