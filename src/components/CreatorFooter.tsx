import { motion } from 'framer-motion';

export function CreatorFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.25 }}
      className="pointer-events-none fixed bottom-3 left-1/2 z-40 -translate-x-1/2"
    >
      <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cosmos-950/65 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.12)]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan shadow-[0_0_8px_#00f0ff]" />
        <span className="font-display text-[10px] sm:text-xs font-medium tracking-[0.28em] text-cyan-100/90 neon-text-cyan whitespace-nowrap">
          ✦ CREATED BY DINESH ✦
        </span>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan shadow-[0_0_8px_#00f0ff]" />
      </div>
    </motion.footer>
  );
}
