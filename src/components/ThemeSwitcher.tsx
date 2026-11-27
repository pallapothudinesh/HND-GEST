import { Monitor, Moon, Sun } from 'lucide-react';
import { ThemeMode, useTheme } from '../context/ThemeContext';
import { neuralAudio } from '../utils/sound';

const OPTIONS: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light Mode', icon: Sun },
  { id: 'dark', label: 'Dark Mode', icon: Moon },
  { id: 'system', label: 'System Default', icon: Monitor },
];

export function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme Switcher"
      className="glass-panel inline-flex items-center gap-0.5 rounded-full p-1"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={active}
            onClick={() => {
              neuralAudio.playClick();
              setMode(opt.id);
            }}
            className={`relative flex items-center justify-center rounded-full p-1.5 transition-all duration-200 ${
              active
                ? 'bg-cyan-400/25 text-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.28)]'
                : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Icon className="h-3.5 w-3.5 transition-transform duration-300" />
          </button>
        );
      })}
    </div>
  );
}
