import type { AppSettings } from '../lib/settings'

type Props = {
  settings: AppSettings
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}

const ChoiceGroup = <T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onSelect: (value: T) => void
}) => (
  <fieldset className="space-y-2">
    <legend className="mb-2 font-semibold">{label}</legend>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onSelect(option.value)}
          className={`zen-choice-button ${value === option.value ? 'is-selected' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </fieldset>
)

const ToggleRow = ({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) => (
  <label className="zen-toggle-row">
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
  </label>
)

export const SettingsPanel = ({ settings, onChange }: Props) => (
  <section className="space-y-6 rounded-lg border border-zinc-500/50 bg-[#f6f3e9] p-4 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 md:p-6">
    <h1 className="text-2xl font-semibold">Settings</h1>

    <section aria-labelledby="display-heading" className="space-y-4">
      <h3 id="display-heading" className="text-xl font-semibold">Display</h3>
      <ChoiceGroup label="Text and interface size" value={settings.uiScale} onSelect={(value) => onChange('uiScale', value)} options={[
        { value: 'normal', label: 'Normal' }, { value: 'large', label: 'Large' }, { value: 'extra-large', label: 'Extra Large' },
      ]} />
      <ChoiceGroup label="Game piece size" value={settings.gamePieceScale} onSelect={(value) => onChange('gamePieceScale', value)} options={[
        { value: 'normal', label: 'Normal' }, { value: 'large', label: 'Large' },
      ]} />
      <ChoiceGroup label="Colour theme" value={settings.theme} onSelect={(value) => onChange('theme', value)} options={[
        { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'Use device setting' },
      ]} />
      <ToggleRow label="High contrast" checked={settings.highContrast} onChange={(value) => onChange('highContrast', value)} />
    </section>

    <section aria-labelledby="interaction-heading" className="space-y-3 border-t border-zinc-400/70 pt-4">
      <h3 id="interaction-heading" className="text-xl font-semibold">Interaction</h3>
      <ToggleRow label="Reduce movement and animation" checked={settings.reducedMotion} onChange={(value) => onChange('reducedMotion', value)} />
      <ChoiceGroup label="Control position" value={settings.handedness} onSelect={(value) => onChange('handedness', value)} options={[
        { value: 'left', label: 'Left handed' }, { value: 'right', label: 'Right handed' },
      ]} />
    </section>

    <section aria-labelledby="simplicity-heading" className="space-y-3 border-t border-zinc-400/70 pt-4">
      <h3 id="simplicity-heading" className="text-xl font-semibold">Simplicity</h3>
      <ToggleRow label="Simple Mode" checked={settings.simpleMode} onChange={(value) => onChange('simpleMode', value)} />
      <p className="text-base leading-relaxed">Simple Mode uses Extra Large text, Large game pieces, high contrast and reduced motion. Your individual display choices return when you turn it off.</p>
    </section>

    <section aria-labelledby="solitaire-heading" className="space-y-3 border-t border-zinc-400/70 pt-4">
      <h3 id="solitaire-heading" className="text-xl font-semibold">Solitaire</h3>
      <ToggleRow label="Show timer" checked={settings.timer} onChange={(value) => onChange('timer', value)} />
      <ToggleRow label="Hide move and time counts" checked={settings.calmStats} onChange={(value) => onChange('calmStats', value)} />
      <div className="space-y-2">
        <p className="font-semibold">Cards drawn from stock</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" aria-pressed={settings.drawMode === 'one'} onClick={() => onChange('drawMode', 'one')} className={`zen-choice-button ${settings.drawMode === 'one' ? 'is-selected' : ''}`}>Draw one</button>
          <button type="button" disabled className="zen-choice-button" aria-describedby="draw-three-help">Draw three</button>
        </div>
        <p id="draw-three-help" className="text-sm">Draw three is not available yet.</p>
      </div>
    </section>
  </section>
)
