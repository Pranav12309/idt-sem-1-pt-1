import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { countryData, countryList, sourceColors, sourceLabels, type SourceKey } from "@/lib/eco-data";

type RankBy = "renPct" | SourceKey;

const RANK_OPTIONS: { key: RankBy; label: string }[] = [
  { key: "renPct", label: "Overall Renewable" },
  { key: "solar", label: "Solar" },
  { key: "wind", label: "Wind" },
  { key: "hydro", label: "Hydro" },
  { key: "biomass", label: "Biomass" },
  { key: "geo", label: "Geothermal" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

interface LeaderboardProps {
  onSelectCountry?: (code: string) => void;
}

export function Leaderboard({ onSelectCountry }: LeaderboardProps) {
  const [rankBy, setRankBy] = useState<RankBy>("renPct");
  const [search, setSearch] = useState("");
  const [showCount, setShowCount] = useState(20);

  const ranked = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = countryList
      .map((code) => ({ code, ...countryData[code] }))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.flag === q);

    list.sort((a, b) => b[rankBy] - a[rankBy]);
    return list;
  }, [rankBy, search]);

  const maxVal = ranked[0]?.[rankBy] ?? 100;
  const displayList = ranked.slice(0, showCount);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl glow-primary">
      {/* Header bar */}
      <div className="flex items-center gap-2 border-b border-border bg-black/30 px-6 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-auto font-mono text-[0.7rem] text-muted-foreground">
          eco-leaderboard v1.0 — Global Rankings
        </span>
      </div>

      <div className="p-6">
        {/* Controls */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {RANK_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => { setRankBy(opt.key); setShowCount(20); }}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-all ${
                  rankBy === opt.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search countries…"
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none sm:w-48"
          />
        </div>

        {/* Leaderboard list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {displayList.map((c, i) => {
              const val = c[rankBy];
              const pct = (val / maxVal) * 100;
              const isTop3 = i < 3;
              const barColor =
                rankBy === "renPct"
                  ? "#00e5a0"
                  : sourceColors[rankBy as SourceKey];

              return (
                <motion.div
                  key={c.code + rankBy}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.3) }}
                  onClick={() => onSelectCountry?.(c.code)}
                  className={`group relative cursor-pointer overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5 transition-all hover:border-primary/30 hover:bg-white/[0.04] ${
                    onSelectCountry ? "cursor-pointer" : ""
                  }`}
                >
                  {/* Background progress bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: Math.min(i * 0.02, 0.4) }}
                    className="absolute inset-y-0 left-0 opacity-10"
                    style={{ backgroundColor: barColor }}
                  />

                  <div className="relative flex items-center gap-3">
                    {/* Rank */}
                    <div className="flex w-8 shrink-0 items-center justify-center font-mono text-sm font-bold">
                      {isTop3 ? (
                        <span className="text-base">{MEDALS[i]}</span>
                      ) : (
                        <span className="text-muted-foreground">{i + 1}</span>
                      )}
                    </div>

                    {/* Flag + Name */}
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="text-lg leading-none">{c.flag}</span>
                      <span className="truncate font-mono text-sm font-medium text-foreground">
                        {c.name}
                      </span>
                    </div>

                    {/* Value */}
                    <div className="flex items-center gap-3">
                      <div className="hidden w-24 sm:block">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: "easeOut", delay: Math.min(i * 0.02, 0.4) }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: barColor }}
                          />
                        </div>
                      </div>
                      <span className="w-12 text-right font-mono text-sm font-bold" style={{ color: barColor }}>
                        {val}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Show more / less */}
        {ranked.length > 20 && !search && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowCount(showCount === 20 ? ranked.length : 20)}
              className="rounded-md border border-white/10 px-4 py-1.5 font-mono text-xs text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
            >
              {showCount === 20 ? `Show All ${ranked.length} Countries` : "Show Top 20"}
            </button>
          </div>
        )}

        {search && ranked.length === 0 && (
          <div className="py-8 text-center font-mono text-sm text-muted-foreground">
            No countries found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
