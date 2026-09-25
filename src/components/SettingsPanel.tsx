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
    className="flex min-h-12 w-full items-center justify-between rounded-md border border-zinc-500/70 bg-white px-4 py-3 text-left text-base text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
  >
    <span>{label}</span>
    <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-950 dark:bg-emerald-900 dark:text-white">{value ? 'On' : 'Off'}</span>
  </button>
)

export const SettingsPanel = ({ settings, onChange }: Props) => {
  return (
    <section className="space-y-3 rounded-lg border border-zinc-500/50 bg-[#f6f3e9] p-4 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <h2 className="text-lg font-semibold">Settings</h2>
      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          {(['light', 'dark'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange('theme', mode)}
              className={`min-h-12 rounded-md border px-4 py-3 text-base ${settings.theme === mode ? 'border-emerald-800 bg-emerald-100 dark:border-emerald-300 dark:bg-emerald-900' : 'border-zinc-500/60 bg-white dark:bg-zinc-800'}`}
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
        <ToggleRow
          label="Hide timer and moves"
          value={settings.calmStats}
          onToggle={() => onChange('calmStats', !settings.calmStats)}
        />
        <ToggleRow
          label="Timer"
          value={settings.timer}
          onToggle={() => onChange('timer', !settings.timer)}
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange('drawMode', 'one')}
            className={`min-h-12 rounded-md border px-4 py-3 text-base ${settings.drawMode === 'one' ? 'border-emerald-800 bg-emerald-100 dark:border-emerald-300 dark:bg-emerald-900' : 'border-zinc-500/60 bg-white dark:bg-zinc-800'}`}
          >
            Draw one
          </button>
          <button
            type="button"
            disabled
            className="min-h-12 rounded-md border border-zinc-600/50 bg-zinc-200 px-4 py-3 text-base text-zinc-500 dark:bg-zinc-800/30 dark:text-zinc-400"
          >
            Draw three later
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(['left', 'right'] as const).map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => onChange('handedness', side)}
              className={`min-h-12 rounded-md border px-4 py-3 text-base ${settings.handedness === side ? 'border-emerald-800 bg-emerald-100 dark:border-emerald-300 dark:bg-emerald-900' : 'border-zinc-500/60 bg-white dark:bg-zinc-800'}`}
            >
              {side === 'left' ? 'Left handed' : 'Right handed'}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
