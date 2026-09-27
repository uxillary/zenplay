import { games, type GameId } from '../app/gameRegistry'
import { demoSupportAmounts, demoSupportMilestones, demoSupporters, type DemoSupporter } from '../lib/supporterDemo'

const gameName = (gameId: GameId) => games.find((game) => game.id === gameId)?.name ?? 'Favourite game'

const StarCount = ({ count }: { count: number }) => (
  <p className="flex min-w-0 flex-wrap items-center gap-2 font-semibold">
    <span aria-hidden="true" className="text-xl">★</span>
    <span>{count.toLocaleString()} lifetime {count === 1 ? 'Star' : 'Stars'}</span>
  </p>
)

const DemoNotice = ({ children }: { children: string }) => (
  <p className="rounded-lg border border-[var(--zp-border-strong)] bg-[var(--zp-panel-alt)] p-3 text-base font-semibold">{children}</p>
)

const SupporterCard = ({ supporter, detailed = false }: { supporter: DemoSupporter; detailed?: boolean }) => (
  <article className="min-w-0 space-y-2 rounded-xl border border-[var(--zp-border)] bg-[var(--zp-panel-alt)] p-4">
    <h3 className="break-words text-lg font-semibold">{supporter.displayName}</h3>
    <p className="font-semibold">ZenPlay supporter · example</p>
    <StarCount count={supporter.lifetimeStars} />
    <dl className="min-w-0 space-y-1 break-words">
      <div><dt className="inline font-semibold">Favourite game: </dt><dd className="inline">{gameName(supporter.favouriteGameId)}</dd></div>
      {detailed ? <div><dt className="inline font-semibold">Example flair: </dt><dd className="inline">{supporter.flair}</dd></div> : null}
      <div><dt className="inline font-semibold">Example statistic: </dt><dd className="inline">{supporter.statistic}</dd></div>
      <div><dt className="inline font-semibold">Supporting since: </dt><dd className="inline">{supporter.supporterSince}</dd></div>
    </dl>
  </article>
)

export const SupporterSpotlight = () => (
  <section aria-labelledby="supporter-spotlight-title" className="mt-8 space-y-4 border-t border-[var(--zp-border)] pt-6">
    <div className="space-y-2">
      <h2 id="supporter-spotlight-title" className="text-2xl font-semibold">Made possible by players like these</h2>
      <DemoNotice>Prototype preview only. These are fictional examples; ZenPlay does not publish supporter profiles.</DemoNotice>
      <p className="text-base">A small thank-you, with no ranking by support. These example cards are not connected to accounts or purchases.</p>
    </div>
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {demoSupporters.map((supporter) => <SupporterCard key={supporter.id} supporter={supporter} />)}
    </div>
  </section>
)

export const SupportZenPlayPanel = ({ onBack }: { onBack: () => void }) => (
  <section className="mx-auto max-w-3xl space-y-6 p-4 md:p-6" aria-labelledby="support-zenplay-title">
    <button type="button" onClick={onBack} className="zen-game-button zen-game-button--back">Back to Profile</button>
    <header className="space-y-2">
      <h1 id="support-zenplay-title" data-screen-heading tabIndex={-1} className="text-2xl font-semibold">Support ZenPlay</h1>
      <p className="text-lg">ZenPlay is free and ad-free. Supporting is completely optional and could help keep it that way.</p>
    </header>
    <DemoNotice>Experience prototype only. Payments are not available, and no supporter status or Stars are being granted.</DemoNotice>

    <section className="space-y-3" aria-labelledby="support-principles-title">
      <h2 id="support-principles-title" className="text-xl font-semibold">What support would mean</h2>
      <ul className="list-disc space-y-2 pl-6 text-base">
        <li>Games and accessibility features stay free for everyone.</li>
        <li>Stars would recognise lifetime support. They would not be a balance to spend.</li>
        <li>Any supporter extras would be optional appearance choices, never gameplay advantages.</li>
      </ul>
    </section>

    <section className="space-y-3" aria-labelledby="support-examples-title">
      <h2 id="support-examples-title" className="text-xl font-semibold">Illustrative Star amounts</h2>
      <p>These are discussion examples only. They are not approved bundles or prices, and there are no purchase controls here.</p>
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
        {demoSupportAmounts.map((amount) => (
          <div key={amount} className="min-w-0 rounded-xl border border-[var(--zp-border)] bg-[var(--zp-panel-alt)] p-3 text-center">
            <p className="break-words text-lg font-semibold">{amount} {amount === 1 ? 'Star' : 'Stars'}</p>
            <p className="text-sm">Example only</p>
          </div>
        ))}
      </div>
    </section>

    <section className="space-y-3" aria-labelledby="supporter-example-title">
      <h2 id="supporter-example-title" className="text-xl font-semibold">Example supporter profile</h2>
      <p>This fictional example shows lifetime Stars alongside other profile details. The Star count stays visible as text, even when it is large.</p>
      <SupporterCard supporter={demoSupporters[0]} detailed />
    </section>

    <section className="space-y-3" aria-labelledby="milestones-title">
      <h2 id="milestones-title" className="text-xl font-semibold">Possible thank-you milestones</h2>
      <DemoNotice>Concepts only. No cosmetics or milestone entitlements are available yet.</DemoNotice>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {demoSupportMilestones.map((milestone) => (
          <article key={milestone.stars} className="min-w-0 space-y-1 rounded-xl border border-[var(--zp-border)] p-4">
            <p className="font-semibold">Example: unlocked at {milestone.stars} {milestone.stars === 1 ? 'Star' : 'Stars'}</p>
            <h3 className="text-lg font-semibold">{milestone.name}</h3>
            <p>{milestone.description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="space-y-3 rounded-xl border border-[var(--zp-border)] p-4" aria-labelledby="visibility-title">
      <h2 id="visibility-title" className="text-xl font-semibold">Your profile would stay private by default</h2>
      <p>In a future version, public supporter recognition would be a separate choice. Supporting would never make a profile public automatically, and visibility could be turned off. Private supporters would still receive the same eligible supporter benefits.</p>
      <p className="font-semibold">This prototype does not publish or change any profile visibility.</p>
    </section>
  </section>
)
