@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-display: 'Syne', sans-serif;
  --font-mono: 'Space Mono', monospace;
  --font-sans: 'DM Sans', sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-card: var(--card);
  --color-card-foreground: var(--foreground);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-teal: var(--teal);
  --color-solar: var(--solar);
  --color-wind: var(--wind);
  --color-hydro: var(--hydro);
  --color-biomass: var(--biomass);
  --color-geo: var(--geo);
  --color-ring: var(--primary);
}

:root {
  /* Eco Viz palette — dark navy with electric green */
  --background: oklch(0.18 0.03 240);
  --surface: oklch(0.22 0.04 240);
  --surface-2: oklch(0.25 0.05 240);
  --foreground: oklch(0.96 0.02 220);
  --card: oklch(0.22 0.04 240 / 0.85);
  --border: oklch(0.78 0.18 165 / 0.15);
  --muted: oklch(0.30 0.04 240);
  --muted-foreground: oklch(0.65 0.05 230);
  --primary: oklch(0.82 0.18 165);          /* #00e5a0 green */
  --primary-foreground: oklch(0.18 0.03 240);
  --teal: oklch(0.78 0.13 200);              /* #00c4d4 */
  --solar: oklch(0.85 0.16 90);              /* #f5c842 */
  --wind: oklch(0.85 0.12 220);              /* #5be2ff */
  --hydro: oklch(0.68 0.16 245);             /* #4fa3f7 */
  --biomass: oklch(0.82 0.18 140);           /* #7ed957 */
  --geo: oklch(0.75 0.18 50);                /* #ff8c42 */
  --radius: 0.75rem;
  --glow: 0 0 60px oklch(0.82 0.18 165 / 0.18);
}

.dark { color-scheme: dark; }

@layer base {
  * { border-color: var(--color-border); }
  html { scroll-behavior: smooth; }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: var(--color-primary); color: var(--color-primary-foreground); }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: var(--color-background); }
  ::-webkit-scrollbar-thumb { background: oklch(0.82 0.18 165 / 0.3); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: oklch(0.82 0.18 165 / 0.6); }
}

@layer utilities {
  .font-display { font-family: var(--font-display); }
  .font-mono { font-family: var(--font-mono); }
  .grid-bg {
    background-image:
      linear-gradient(oklch(0.82 0.18 165 / 0.04) 1px, transparent 1px),
      linear-gradient(90deg, oklch(0.82 0.18 165 / 0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .glow-primary { box-shadow: var(--glow); }
  .text-gradient-primary {
    background: linear-gradient(135deg, var(--color-primary), var(--color-teal));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }

@keyframes map-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.6); opacity: 0.3; }
}
