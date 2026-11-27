import { motion } from 'framer-motion';
import { Compass, Globe2, Info, Orbit, Sliders, Sparkles } from 'lucide-react';
import { MenuSection } from '../types/scene';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HolographicMenuProps {
  activeSection: MenuSection;
  isWorldLabActive: boolean;
  onSelectSection: (section: MenuSection) => void;
  onOpenWorldHub: () => void;
}

const MENU_ITEMS: { id: MenuSection; label: string; icon: typeof Orbit }[] = [
  { id: 'universe', label: 'Universe', icon: Orbit },
  { id: 'planets', label: 'Planets', icon: Globe2 },
  { id: 'particles', label: 'Particles', icon: Sparkles },
  { id: 'controls', label: 'Controls', icon: Sliders },
  { id: 'about', label: 'About', icon: Info },
];

export function HolographicMenu({
  activeSection,
  isWorldLabActive,
  onSelectSection,
  onOpenWorldHub,
}: HolographicMenuProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Holographic Navigation"
      className="fixed left-1/2 top-20 sm:top-5 z-30 -translate-x-1/2"
    >
      <div className="glass-panel flex items-center gap-1 rounded-full p-1 sm:gap-1.5 sm:p-1.5">
        <button
          data-spatial-clickable="true"
          onClick={onOpenWorldHub}
          className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-4 sm:py-1.5 font-display text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 ${
            isWorldLabActive
              ? 'bg-violet-500/30 text-white border border-violet-400/70 shadow-[0_0_18px_rgba(139,92,246,0.4)]'
              : 'bg-cyan-500/15 text-cyan-100 hover:bg-cyan-400/25 hover:text-white border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
          }`}
        >
          <Compass className="h-3.5 w-3.5 text-neon-cyan" />
          <span>LABS</span>
        </button>

        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = !isWorldLabActive && activeSection === item.id;
          return (
            <button
              key={item.id}
              data-spatial-clickable="true"
              onClick={() => onSelectSection(item.id)}
              className={`relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 font-display text-[10px] sm:text-[11px] tracking-[0.14em] uppercase transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-400/20 text-white border border-cyan-400/50 shadow-[0_0_16px_rgba(0,240,255,0.25)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-cyan-200 border border-transparent'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-neon-cyan' : ''}`} />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}

        <div className="mx-0.5 h-4 w-px bg-slate-500/30" />
        <ThemeSwitcher />
      </div>
    </motion.nav>
  );
}
