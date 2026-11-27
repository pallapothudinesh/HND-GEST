interface HndGestLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function HndGestLogo({ size = 'md' }: HndGestLogoProps) {
  const dim = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={`${dim} shrink-0 drop-shadow-[0_0_10px_rgba(0,240,255,0.55)]`}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="27" stroke="#00f0ff" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="7 4" />
      <circle cx="32" cy="32" r="20" stroke="#3b82f6" strokeOpacity="0.65" strokeWidth="1.8" />
      <path
        d="M24 44V26a2.2 2.2 0 0 1 4.4 0v9h1.6V19a2.2 2.2 0 0 1 4.4 0v16h1.6V22a2.2 2.2 0 0 1 4.4 0v13h1.6V27a2.2 2.2 0 0 1 4.4 0v13.5c0 5.5-4.5 9.5-10 9.5h-4.4c-4.4 0-8-2.8-8-6z"
        stroke="#00f0ff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32.2" cy="18.5" r="2.4" fill="#00f0ff" />
    </svg>
  );
}
