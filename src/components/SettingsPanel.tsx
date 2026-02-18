import type { AppSettings } from '../lib/settings'

type Props = {
  settings: AppSettings
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}

const ToggleRow = ({
  label,
  value,
  onToggle,
}: {
  label: string
  value: boolean
  onToggle: () => void
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex w-full items-center justify-between rounded-xl border border-zinc-500/60 bg-zinc-800/70 px-4 py-3 text-left text-base"
  >
    <span>{label}</span>
    <span className="rounded-lg bg-zinc-700 px-3 py-1 text-sm">{value ? 'On' : 'Off'}</span>
  </button>
)

export const SettingsPanel = ({ settings, onChange }: Props) => {
  return (
    <section className="space-y-3 rounded-2xl border border-zinc-500/50 bg-zinc-900/70 p-4">
      <h2 className="text-lg font-semibold">Settings</h2>
      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          {(['light', 'dark'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange('theme', mode)}
              className={`rounded-xl border px-4 py-3 text-base ${settings.theme === mode ? 'border-sky-400 bg-sky-500/25' : 'border-zinc-500/60 bg-zinc-800/70'}`}
            >
              {mode === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
        <ToggleRow
          label="High contrast"
          value={settings.highContrast}
          onToggle={() => onChange('highContrast', !settings.highContrast)}
        />
        <ToggleRow
          label="Large cards"
          value={settings.largeCards}
          onToggle={() => onChange('largeCards', !settings.largeCards)}
        />
        <ToggleRow
          label="Reduced motion"
          value={settings.reducedMotion}
          onToggle={() => onChange('reducedMotion', !settings.reducedMotion)}
        />
        <div className="grid grid-cols-2 gap-2">
          {(['left', 'right'] as const).map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => onChange('handedness', side)}
              className={`rounded-xl border px-4 py-3 text-base ${settings.handedness === side ? 'border-sky-400 bg-sky-500/25' : 'border-zinc-500/60 bg-zinc-800/70'}`}
            >
              {side === 'left' ? 'Left handed' : 'Right handed'}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
