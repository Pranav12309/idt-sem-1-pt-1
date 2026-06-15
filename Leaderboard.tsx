import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  countryData,
  countryList,
  dominantSource,
  fcYears,
  sourceColors,
  sourceLabels,
  trendYears,
  type SourceKey,
} from "@/lib/eco-data";

const isClient = typeof window !== "undefined";

type Tab = "bar" | "trend" | "forecast";

const SOURCES: SourceKey[] = ["solar", "wind", "hydro", "biomass", "geo"];

export function Dashboard() {
  const [country, setCountry] = useState("CHN");
  const [tab, setTab] = useState<Tab>("bar");
  const [hoverBar, setHoverBar] = useState<SourceKey | null>(null);
  const [search, setSearch] = useState("");
  const d = countryData[country];
  if (!d) return null;
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countryList;
    return countryList.filter((c) => {
      const cd = countryData[c];
      if (!cd) return false;
      return cd.name.toLowerCase().includes(q) || c.toLowerCase().includes(q);
    });
  }, [search]);


  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl glow-primary">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-border bg-black/30 px-6 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-auto font-mono text-[0.7rem] text-muted-foreground">
          eco-viz-dashboard v1.0 — Renewable Energy Intelligence
        </span>
      </div>

      <div className="grid md:grid-cols-2">
        {/* Map panel */}
        <div className="border-b border-border p-6 md:border-b-0 md:border-r">
          <div className="mb-4 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
            🗺 World Map — Country Selection
          </div>
          <WorldMap selected={country} onSelect={setCountry} />
          <div className="mt-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${countryList.length} countries…`}
              className="mb-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
            />
            <div className="max-h-[140px] overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-1.5">
                {filteredList.map((c) => {
                  const cd = countryData[c];
                  if (!cd) return null;
                  return (
                    <button
                      key={c}
                      onClick={() => setCountry(c)}
                      className={`rounded-full border px-2.5 py-1 font-mono text-[0.7rem] transition-all ${
                        c === country
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/10 text-muted-foreground hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {cd.flag} {cd.name}
                    </button>
                  );
                })}
                {filteredList.length === 0 && (
                  <span className="font-mono text-xs text-muted-foreground">No matches</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Charts panel */}
        <div className="p-6">
          <motion.div
            key={country}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground"
          >
            📊 {countryData[country].flag} {countryData[country].name} — Renewable Energy Mix
          </motion.div>

          <div className="mb-5 flex gap-2">
            {(["bar", "trend", "forecast"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs capitalize transition-all ${
                  tab === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-muted-foreground hover:border-primary/40"
                }`}
              >
                {t === "bar" ? "Bar Chart" : t === "trend" ? "Trend" : "Forecast"}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            <AnimatePresence mode="wait">
              {tab === "bar" && (
                <motion.div
                  key={`bar-${country}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <BarChart d={d} hover={hoverBar} setHover={setHoverBar} />
                </motion.div>
              )}
              {tab === "trend" && (
                <motion.div
                  key={`trend-${country}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendChart pts={d.trend} />
                </motion.div>
              )}
              {tab === "forecast" && (
                <motion.div
                  key={`fc-${country}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ForecastChart hist={d.trend} fc={d.forecast} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DonutBlock d={d} />
        </div>
      </div>
    </div>
  );
}

/* ───────── World Map (real geographic projection) ───────── */
import { ComposableMap, Geographies, Geography, Marker, Graticule, Sphere } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";


function WorldMap({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !isClient) {
    return (
      <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-primary/[0.03]">
        <span className="font-mono text-xs text-muted-foreground">Loading map…</span>
      </div>
    );
  }

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-lg border border-border bg-primary/[0.03]">
      <ComposableMap
        projectionConfig={{ scale: 145 }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5a0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00e5a0" stopOpacity="0" />
          </radialGradient>
        </defs>

        <Sphere id="sphere" stroke="rgba(0,229,160,0.15)" strokeWidth={0.5} fill="transparent" />
        <Graticule stroke="rgba(0,229,160,0.07)" strokeWidth={0.4} />

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: "rgba(0,229,160,0.08)",
                    stroke: "rgba(0,229,160,0.35)",
                    strokeWidth: 0.5,
                    outline: "none",
                  },
                  hover: {
                    fill: "rgba(0,229,160,0.18)",
                    stroke: "rgba(0,229,160,0.5)",
                    strokeWidth: 0.6,
                    outline: "none",
                  },
                  pressed: { fill: "rgba(0,229,160,0.25)", outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {countryList.map((code) => {
          const d = countryData[code];
          if (!d || (d.lat === 0 && d.lng === 0)) return null;
          const coords: [number, number] = [d.lng, d.lat];
          const src = dominantSource(code);
          const color = sourceColors[src];
          const isActive = code === selected;
          const baseR = 2 + (d.renPct / 100) * 3.5;

          return (
            <Marker key={code} coordinates={coords} onClick={() => onSelect(code)} style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" }, pressed: { cursor: "pointer" } }}>
              {isActive && <circle r={22} fill="url(#map-glow)" />}
              <circle r={baseR + 0.8} fill={color} opacity={isActive ? 1 : 0.8} stroke="#0a1410" strokeWidth={0.4}>
                {isActive && <animate attributeName="r" values={`${baseR};${baseR + 1.5};${baseR}`} dur="3s" repeatCount="indefinite" />}
              </circle>
              {isActive && (
                <>
                  <circle r={baseR + 4} fill="none" stroke="#00e5a0" strokeWidth={1.2}>
                    <animate attributeName="r" values={`${baseR + 4};${baseR + 14};${baseR + 4}`} dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <text y={-baseR - 6} fill="#00e5a0" fontSize={9} fontFamily="monospace" fontWeight={700} textAnchor="middle">
                    {d.name}
                  </text>

                </>
              )}
            </Marker>
          );
        })}
      </ComposableMap>
      <div className="pointer-events-none absolute left-3 top-2 font-mono text-[10px] tracking-widest text-primary/50">
        RENEWABLE ENERGY · GLOBAL MAP · {countryList.length} NATIONS
      </div>
    </div>
  );
}




/* ───────── Bar Chart ───────── */
function BarChart({ d, hover, setHover }: { d: typeof countryData["China"]; hover: SourceKey | null; setHover: (k: SourceKey | null) => void }) {
  const max = Math.max(...SOURCES.map((s) => d[s]));
  return (
    <div>
      <div className="flex h-[180px] items-end gap-2 pb-2">
        {SOURCES.map((s) => {
          const pct = d[s];
          const h = (pct / max) * 100;
          const isHover = hover === s;
          return (
            <div
              key={s}
              className="relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(null)}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full cursor-pointer rounded-t-md transition-[filter] hover:brightness-125"
                style={{ background: sourceColors[s] }}
              />
              <motion.span
                initial={false}
                animate={{ opacity: isHover ? 1 : 0.85, y: isHover ? -4 : 0 }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] text-foreground"
              >
                {pct}%
              </motion.span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {SOURCES.map((s) => (
          <div key={s} className="flex-1 text-center font-mono text-[0.6rem] text-muted-foreground">
            {sourceLabels[s]}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Trend Chart ───────── */
function TrendChart({ pts }: { pts: number[] }) {
  const w = 400, h = 160;
  const { line, area, coords } = useMemo(() => buildPaths(pts, w, h), [pts]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[180px] w-full">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00e5a0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00e5a0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill="url(#trendGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.path d={line} fill="none" stroke="#00e5a0" strokeWidth="2"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeInOut" }} />
      {coords.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="3" fill="#00e5a0"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.04 }} />
      ))}
      {trendYears.map((yr, i) =>
        i % 2 === 0 ? (
          <text key={yr} x={coords[i][0]} y={h - 1} fill="rgba(107,140,170,0.8)" fontSize="7" fontFamily="monospace" textAnchor="middle">
            {yr}
          </text>
        ) : null
      )}
    </svg>
  );
}

/* ───────── Forecast Chart ───────── */
function ForecastChart({ hist, fc }: { hist: number[]; fc: number[] }) {
  const w = 400, h = 160;
  const histTail = hist.slice(-3);
  const all = [...histTail, ...fc];
  const total = all.length;
  const toCoord = (v: number, i: number): [number, number] => {
    const x = (i / (total - 1)) * (w - 20) + 10;
    const y = h - 10 - (v / 100) * (h - 20);
    return [x, y];
  };
  const histCoords = histTail.map((v, i) => toCoord(v, i));
  const fcCoords = fc.map((v, i) => toCoord(v, i + 3));
  const divX = histCoords[histCoords.length - 1][0];
  const histPath = histCoords.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const fcPath = [histCoords[histCoords.length - 1], ...fcCoords].map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = fcPath + ` L ${fcCoords[fcCoords.length - 1][0]} ${h - 2} L ${divX} ${h - 2} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[180px] w-full">
      <defs>
        <linearGradient id="fcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5c842" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f5c842" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={areaPath} fill="url(#fcGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.path d={histPath} fill="none" stroke="#00e5a0" strokeWidth="2"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
      <motion.path d={fcPath} fill="none" stroke="#f5c842" strokeWidth="2" strokeDasharray="6,3"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.5 }} />
      <line x1={divX} y1={10} x2={divX} y2={h - 10} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3,3" />
      <text x={divX - 8} y={20} fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">NOW</text>
      {fcYears.map((yr, i) => {
        const [x, y] = fcCoords[i];
        return (
          <g key={yr}>
            <text x={x} y={h - 1} fill="rgba(245,200,66,0.7)" fontSize="7" fontFamily="monospace" textAnchor="middle">{yr}</text>
            <motion.circle cx={x} cy={y} r="3" fill="#f5c842" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.08 }} />
          </g>
        );
      })}
    </svg>
  );
}

/* ───────── Donut ───────── */
function DonutBlock({ d }: { d: typeof countryData["China"] }) {
  const total = SOURCES.reduce((acc, s) => acc + d[s], 0);
  const circ = 2 * Math.PI * 38;
  let accumulated = 0;
  const arcs = SOURCES.map((s) => {
    const pct = d[s] / total;
    const dash = pct * circ;
    const offset = -(accumulated / total) * circ;
    accumulated += d[s];
    return { s, dash, offset };
  });

  return (
    <div className="mt-5 flex items-center gap-6 border-t border-border pt-5">
      <div className="relative h-[100px] w-[100px] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          {arcs.map(({ s, dash, offset }) => (
            <motion.circle
              key={s}
              cx="50" cy="50" r="38" fill="none" strokeWidth="12" strokeLinecap="round"
              stroke={sourceColors[s]}
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${dash} ${circ - dash}`, strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
          <div className="text-xl font-bold text-primary">{d.renPct}%</div>
          <div className="text-[0.55rem] text-muted-foreground">Renewable</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {SOURCES.map((s) => (
          <div key={s} className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: sourceColors[s] }} />
            <span>{sourceLabels[s]}</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">{d[s]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Helpers ───────── */
function buildPaths(pts: number[], w: number, h: number) {
  const coords: [number, number][] = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * (w - 20) + 10;
    const y = h - 10 - (v / 100) * (h - 20);
    return [x, y];
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const area = `${line} L ${coords[coords.length - 1][0]} ${h - 2} L ${coords[0][0]} ${h - 2} Z`;
  return { line, area, coords };
}
