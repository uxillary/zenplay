import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { GameDefinition } from '../app/gameRegistry'
import type { LocalProfile } from '../lib/localProfile'
import type { AccountUser, RemotePrivateProfile } from '../lib/accountService'
import { createBrowserAccountService } from '../lib/supabaseAccountService'

type Props = {
  localProfile: LocalProfile | null
  games: readonly GameDefinition[]
}

type Operation = 'sending-code' | 'verifying-code' | 'connecting' | 'updating-profile' | 'signing-out' | null
type ProfileLoadState = 'none' | 'loading' | 'missing' | 'present' | 'error'

const toDraft = (profile: Pick<RemotePrivateProfile, 'display_name' | 'favourite_game_id'>) => ({
  displayName: profile.display_name,
  favouriteGameId: profile.favourite_game_id ?? '',
})

export const AccountPanel = ({ localProfile, games }: Props) => {
  const service = useMemo(() => createBrowserAccountService(), [])
  const [accountUser, setAccountUser] = useState<AccountUser | null>(null)
  const [authState, setAuthState] = useState<'unconfigured' | 'loading' | 'signed-out' | 'signed-in' | 'error'>(
    service.configured ? 'loading' : 'unconfigured',
  )
  const [operation, setOperation] = useState<Operation>(null)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [remoteProfile, setRemoteProfile] = useState<RemotePrivateProfile | null>(null)
  const [profileLoadState, setProfileLoadState] = useState<ProfileLoadState>('none')
  const [draft, setDraft] = useState({ displayName: '', favouriteGameId: '' })
  const [connectConfirmed, setConnectConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const codeInputRef = useRef<HTMLInputElement>(null)
  const sendInProgress = useRef(false)
  const gameIds = useMemo(() => games.map((game) => game.id), [games])
  const accountUserId = accountUser?.id ?? null
  const localProfileId = localProfile?.profileId ?? null
  const localDisplayName = localProfile?.displayName ?? ''
  const localFavouriteGameId = localProfile?.favouriteGameId ?? ''
  const currentRemoteProfile = remoteProfile?.id === accountUserId ? remoteProfile : null

  const setUser = useCallback((user: AccountUser | null) => {
    setAccountUser(user)
    setAuthState(user ? 'signed-in' : 'signed-out')
    setError('')
  }, [])

  useEffect(() => {
    if (!service.configured) return
    let active = true
    let authEventReceived = false
    const unsubscribe = service.subscribeToAuthChanges((user) => {
      authEventReceived = true
      if (active) setUser(user)
    })
    void service.getCurrentUser().then((user) => {
      if (active && !authEventReceived) setUser(user)
    }).catch(() => {
      if (active && !authEventReceived) {
        setAuthState('error')
        setError('We could not check the online account right now. Your local profile and games are still available.')
      }
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [service, setUser])

  const loadRemoteProfile = useCallback(async () => {
    if (!accountUser) return
    setProfileLoadState('loading')
    setError('')
    try {
      const loaded = await service.getPrivateProfile()
      setRemoteProfile(loaded)
      setProfileLoadState(loaded ? 'present' : 'missing')
      if (loaded) setDraft(toDraft(loaded))
      else if (localProfile) {
        setDraft({ displayName: localProfile.displayName, favouriteGameId: localProfile.favouriteGameId ?? '' })
        setConnectConfirmed(false)
      } else setDraft({ displayName: '', favouriteGameId: '' })
    } catch {
      setProfileLoadState('error')
      setError('The account profile could not be refreshed. Your local profile and games are still available.')
    }
  }, [accountUser, localProfile, service])

  useEffect(() => {
    setRemoteProfile(null)
    setConnectConfirmed(false)
    if (!accountUserId) {
      setProfileLoadState('none')
      return
    }
    let active = true
    setProfileLoadState('loading')
    void service.getPrivateProfile().then((loaded) => {
      if (!active) return
      setRemoteProfile(loaded)
      setProfileLoadState(loaded ? 'present' : 'missing')
      if (loaded) setDraft(toDraft(loaded))
      else setDraft({ displayName: '', favouriteGameId: '' })
    }).catch(() => {
      if (active) {
        setProfileLoadState('error')
        setError('The account profile could not be refreshed. Your local profile and games are still available.')
      }
    })
    return () => { active = false }
  }, [accountUserId, service])

  useEffect(() => {
    if (profileLoadState !== 'missing' || !localProfileId || currentRemoteProfile) return
    setDraft({ displayName: localDisplayName, favouriteGameId: localFavouriteGameId })
    setConnectConfirmed(false)
  }, [currentRemoteProfile, localDisplayName, localFavouriteGameId, localProfileId, profileLoadState])

  useEffect(() => {
    if (resendSeconds <= 0) return
    const timer = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [resendSeconds])

  const sendCode = async () => {
    if (sendInProgress.current || resendSeconds > 0) return
    sendInProgress.current = true
    setError('')
    setMessage('')
    setOperation('sending-code')
    try {
      await service.sendEmailCode(email)
      setCodeSent(true)
      setCode('')
      setResendSeconds(60)
      setMessage('If this address can receive ZenPlay email, a one-time code should arrive shortly.')
      window.requestAnimationFrame(() => codeInputRef.current?.focus())
    } catch {
      setResendSeconds(60)
      setError('We could not send a code right now. Check the address and wait a moment before trying again.')
    } finally {
      sendInProgress.current = false
      setOperation(null)
    }
  }

  const requestCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendCode()
  }

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setOperation('verifying-code')
    try {
      const user = await service.verifyEmailCode(email, code)
      setUser(user)
      setCodeSent(false)
      setCode('')
      setMessage('Your ZenPlay account is connected on this device.')
    } catch {
      setError('We could not verify that code. Check it and try again.')
    } finally {
      setOperation(null)
    }
  }

  const saveRemoteProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setOperation(currentRemoteProfile ? 'updating-profile' : 'connecting')
    try {
      const saved = currentRemoteProfile
        ? await service.updatePrivateProfile({ displayName: draft.displayName, favouriteGameId: draft.favouriteGameId || null }, gameIds)
        : await service.connectLocalProfile(localProfile, { displayName: draft.displayName, favouriteGameId: draft.favouriteGameId || null }, connectConfirmed, gameIds)
      setRemoteProfile(saved)
      setDraft(toDraft(saved))
      setProfileLoadState('present')
      setConnectConfirmed(false)
      setMessage(currentRemoteProfile ? 'Online profile updated. Your local profile is unchanged.' : 'Your private profile is connected to this account.')
    } catch {
      setError(currentRemoteProfile
        ? 'The online profile could not be saved. Your local profile is unchanged.'
        : 'The profile could not be connected. Your local profile and games are unchanged.')
    } finally {
      setOperation(null)
    }
  }

  const signOut = async () => {
    setError('')
    setMessage('')
    setOperation('signing-out')
    try {
      await service.signOut()
      setUser(null)
      setRemoteProfile(null)
      setCodeSent(false)
      setMessage('Signed out. Your local profile, games, saves, statistics and settings are unchanged.')
    } catch {
      setError('We could not end the online session right now. Your local profile and games are still available.')
    } finally {
      setOperation(null)
    }
  }

  const busy = operation !== null

  return (
    <section className="space-y-3 border-t border-[var(--zp-border)] pt-4" aria-labelledby="account-title">
      <h2 id="account-title" className="text-xl font-semibold">Optional account</h2>
      <p>An account can support future supporter features and help restore supporter extras across devices. Game saves, statistics, settings and accessibility stay on this device. You can play without connecting an account.</p>

      {message ? <p role="status" aria-live="polite" className="rounded-lg border border-[var(--zp-border)] p-3">{message}</p> : null}
      {error ? <p id="account-error" role="alert" className="rounded-lg border border-amber-700 p-3">{error}</p> : null}
      {operation ? <p role="status" aria-live="polite">{operation === 'sending-code' ? 'Sending a code…' : operation === 'verifying-code' ? 'Checking the code…' : operation === 'connecting' ? 'Connecting profile…' : operation === 'updating-profile' ? 'Saving online profile…' : 'Signing out…'}</p> : null}

      {authState === 'unconfigured' ? <p>Online accounts are not configured in this build. ZenPlay works normally without them.</p> : null}

      {authState === 'loading' ? <p role="status" aria-live="polite">Checking the optional account on this device…</p> : null}

      {authState === 'error' ? <button type="button" onClick={() => {
        setAuthState('loading')
        setError('')
        void service.getCurrentUser().then(setUser).catch(() => {
          setAuthState('error')
          setError('We could not check the online account right now. Your local profile and games are still available.')
        })
      }} className="zen-game-button" disabled={busy}>Try account again</button> : null}

      {authState === 'signed-out' ? !codeSent ? (
        <form className="space-y-3" onSubmit={(event) => void requestCode(event)}>
          <p>Connecting is optional. We use your email only for sign-in; it is not added to your local profile.</p>
          <div className="space-y-2">
            <label htmlFor="account-email" className="block font-semibold">Email address</label>
            <input
              id="account-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full min-w-0 rounded-lg border border-current bg-transparent p-3"
              aria-describedby={error ? 'account-error' : undefined}
              aria-invalid={Boolean(error)}
            />
          </div>
            <button type="submit" className="zen-game-button zen-game-button--primary" disabled={busy || resendSeconds > 0}>{resendSeconds > 0 ? `Send a sign-in code in ${resendSeconds}s` : 'Send a sign-in code'}</button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={(event) => void verifyCode(event)}>
          <p>Enter the one-time code sent to <span className="font-semibold">{email}</span>.</p>
          <div className="space-y-2">
            <label htmlFor="account-code" className="block font-semibold">Six-digit sign-in code</label>
            <input
              ref={codeInputRef}
              id="account-code"
              type="text"
              name="one-time-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full min-w-0 rounded-lg border border-current bg-transparent p-3"
              aria-describedby={error ? 'account-error' : 'account-code-help'}
              aria-invalid={Boolean(error)}
            />
            <p id="account-code-help" className="text-sm">The code is used only to sign in and is not saved by ZenPlay.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="zen-game-button zen-game-button--primary" disabled={busy || code.length !== 6}>{operation === 'verifying-code' ? 'Checking code…' : 'Verify code'}</button>
            <button type="button" className="zen-game-button" disabled={busy || resendSeconds > 0} onClick={() => void sendCode()}>{resendSeconds > 0 ? `Send another code in ${resendSeconds}s` : 'Send another code'}</button>
            <button type="button" className="zen-game-button" disabled={busy} onClick={() => { setCodeSent(false); setCode(''); setError(''); setMessage('') }}>Use a different email</button>
          </div>
        </form>
      ) : null}

      {authState === 'signed-in' ? (
        <div className="space-y-4 rounded-xl border border-[var(--zp-border)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold" role="status">Account connected on this device</p>
            <button type="button" className="zen-game-button" disabled={busy || profileLoadState === 'loading'} onClick={() => void loadRemoteProfile()}>Refresh online profile</button>
          </div>

          {profileLoadState === 'loading' ? <p role="status" aria-live="polite">Loading private account profile…</p> : null}
          {profileLoadState === 'error' ? <p role="status">The remote profile could not be refreshed. Any details shown below are the last successfully loaded values.</p> : null}
          {profileLoadState === 'missing' && !localProfile ? <p>Create a local profile first. Connecting it is a separate choice, and only its name and selected favourite game can be sent.</p> : null}

          {(profileLoadState === 'missing' && localProfile) || Boolean(currentRemoteProfile) ? (
            <form className="space-y-3" onSubmit={(event) => void saveRemoteProfile(event)}>
              <h3 className="text-lg font-semibold">{currentRemoteProfile ? 'Private account profile' : 'Connect this profile'}</h3>
              <div className="space-y-2">
                <label htmlFor="remote-profile-name" className="block font-semibold">Account display name</label>
                <input
                  id="remote-profile-name"
                  type="text"
                  autoComplete="nickname"
                  minLength={2}
                  maxLength={32}
                  required
                  value={draft.displayName}
                  onChange={(event) => setDraft((current) => ({ ...current, displayName: event.target.value }))}
                  className="w-full min-w-0 rounded-lg border border-current bg-transparent p-3"
                  aria-describedby={error ? 'account-error' : 'remote-profile-name-help'}
                  aria-invalid={Boolean(error)}
                />
                <p id="remote-profile-name-help" className="text-sm">This private account name is separate from later public profile choices.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="remote-profile-game" className="block font-semibold">Favourite game (optional)</label>
                <select
                  id="remote-profile-game"
                  value={draft.favouriteGameId}
                  onChange={(event) => setDraft((current) => ({ ...current, favouriteGameId: event.target.value }))}
                  className="w-full min-w-0 rounded-lg border border-current bg-transparent p-3"
                >
                  <option value="">No favourite selected</option>
                  {games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
                </select>
              </div>
              {currentRemoteProfile ? (
                <p>Saving changes updates only this private online profile. Your local profile, game saves, statistics and settings remain separate.</p>
              ) : (
                <label className="flex items-start gap-3 rounded-lg border border-[var(--zp-border)] p-3">
                  <input
                    type="checkbox"
                    checked={connectConfirmed}
                    onChange={(event) => setConnectConfirmed(event.target.checked)}
                    className="mt-1 min-h-5 min-w-5"
                  />
                  <span>I agree to save only this display name and favourite game to my ZenPlay account. My game saves, statistics and settings stay on this device.</span>
                </label>
              )}
              <button type="submit" className="zen-game-button zen-game-button--primary" disabled={busy || (!remoteProfile && !connectConfirmed)}>
                {operation === 'connecting' ? 'Connecting profile…' : operation === 'updating-profile' ? 'Saving online profile…' : currentRemoteProfile ? 'Save online profile' : 'Connect this profile'}
              </button>
            </form>
          ) : null}

          <button type="button" className="zen-game-button" disabled={busy} onClick={() => void signOut()}>{operation === 'signing-out' ? 'Signing out…' : 'Sign out on this device'}</button>
          <p className="text-sm">Remote account deletion is not available yet. Removing your local profile is separate and does not delete this account.</p>
        </div>
      ) : null}
    </section>
  )
}
