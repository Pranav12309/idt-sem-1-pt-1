import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#leaderboard", label: "Leaderboard" },
  { href: "#problem", label: "Problem" },
  { href: "#methodology", label: "Methodology" },
  { href: "#tools", label: "Tools" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive("#" + e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b transition-all ${
          scrolled
            ? "border-border bg-background/85 px-6 py-3 backdrop-blur-xl"
            : "border-transparent bg-background/40 px-6 py-4 backdrop-blur-md md:px-12"
        }`}
      >
        <a href="#" className="font-display text-xl font-extrabold tracking-tight text-primary">
          Eco<span className="text-foreground">Viz</span>
        </a>

        <ul className="hidden gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`relative font-mono text-[0.78rem] uppercase tracking-wider transition-colors ${
                  active === l.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {l.label}
                {active === l.href && (
                  <motion.span layoutId="nav-underline" className="absolute -bottom-1 left-0 h-px w-full bg-primary" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-primary px-3 py-1.5 font-mono text-[0.68rem] font-bold tracking-wider text-primary-foreground md:block">
            SDG 7 · SDG 12
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
          >
            <span className="text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>

        <motion.div
          style={{ scaleX, transformOrigin: "0% 50%" }}
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-primary via-teal to-primary"
        />
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-3 top-16 z-40 rounded-xl border border-border bg-surface/95 p-4 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-2">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 font-mono text-sm uppercase tracking-wider text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
