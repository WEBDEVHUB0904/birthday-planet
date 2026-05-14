import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { CosmicBackground } from "@/components/CosmicBackground";
import { WarpTransition } from "@/components/WarpTransition";
import { Sparkles, ArrowRight, Mouse } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Lazy-load the heavy 3D scene so the landing page stays fast
const HubScene = lazy(() => import("@/scenes/HubScene").then((m) => ({ default: m.HubScene })));

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: Record<string, unknown>) => ({
    enter: search.enter === "hub" ? "hub" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "A Universe Made For You" },
      {
        name: "description",
        content:
          "Some stories deserve their own universe. Step inside a cinematic birthday experience made just for you.",
      },
    ],
  }),
});

type Phase = "landing" | "warp" | "hub";

function Index() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const { enter } = Route.useSearch();
  const [phase, setPhase] = useState<Phase>(() => (enter === "hub" ? "hub" : "landing"));

  useEffect(() => {
    if (enter === "hub") {
      setPhase("hub");
    }
  }, [enter]);

  // Magnetic hover
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px) scale(1.04)`;
  };
  const handleLeave = () => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = "translate(0,0) scale(1)";
  };

  const handleEnter = () => {
    setPhase("warp");
  };

  const handleWarpComplete = () => {
    setPhase("hub");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ═══════════ PHASE 1: LANDING PAGE ═══════════════════ */}
        {phase === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-screen w-full"
          >
            <CosmicBackground />

            <section className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center px-6 text-center">
              <p
                className="mb-10 inline-flex items-center gap-3 text-sm md:text-base font-light tracking-[0.04em] text-white/80 animate-fade-up"
                style={{ animationDelay: "0.5s" }}
              >
                <Sparkles className="h-4 w-4 text-[oklch(0.85_0.18_330)]" />
                <span className="font-display italic text-glow-soft" style={{ fontSize: "1.05em" }}>
                  Some stories deserve their own universe…
                </span>
                <Sparkles className="h-4 w-4 text-[oklch(0.85_0.18_330)]" />
              </p>

              <h1 className="font-display font-light leading-[0.95] tracking-tight">
                <span
                  className="block text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] animate-fade-up"
                  style={{
                    animationDelay: "0.9s",
                    color: "oklch(0.98 0.02 300)",
                    textShadow:
                      "0 2px 30px oklch(0.05 0.05 280 / 0.9), 0 0 60px oklch(0.05 0.05 280 / 0.7), 0 0 24px oklch(0.8 0.18 320 / 0.35)",
                  }}
                >
                  This one is
                </span>
                <span
                  className="mt-2 block text-7xl sm:text-8xl md:text-9xl lg:text-[10.5rem] italic"
                  style={{
                    animation:
                      "fadeUp 1.6s cubic-bezier(0.22, 1, 0.36, 1) both, wordGlow 4.5s ease-in-out infinite",
                    animationDelay: "1.3s",
                    background:
                      "linear-gradient(135deg, oklch(1 0.05 330) 0%, oklch(0.85 0.28 340) 35%, oklch(0.78 0.3 310) 65%, oklch(0.82 0.26 280) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  yours.
                </span>
              </h1>

              {/* Divider */}
              <div
                className="mt-10 flex items-center gap-3 animate-fade-up"
                style={{ animationDelay: "1.7s" }}
              >
                <span className="h-px w-16 bg-linear-to-r from-transparent to-white/40" />
                <span className="text-[oklch(0.85_0.18_330)]">✦</span>
                <span className="h-px w-16 bg-linear-to-l from-transparent to-white/40" />
              </div>

              <p
                className="mt-8 max-w-xl text-base md:text-lg font-light leading-relaxed text-white/65 animate-fade-up"
                style={{ animationDelay: "1.9s" }}
              >
                A galaxy spun from memories, wishes, and the quiet light of someone who matters more
                than words can hold.
              </p>

              {/* Magnetic Enter Button */}
              <div
                className="mt-14 animate-fade-up"
                style={{ animationDelay: "2.3s" }}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
              >
                <button
                  ref={btnRef}
                  type="button"
                  onClick={handleEnter}
                  className="btn-cosmic group relative inline-flex items-center gap-4 rounded-full px-14 py-5 text-sm font-medium tracking-[0.42em] uppercase text-white transition-transform duration-500 ease-out"
                >
                  <span className="relative z-10">Enter</span>
                  <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
                </button>
              </div>

              {/* Scroll hint */}
              <div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-fade-up"
                style={{ animationDelay: "2.8s" }}
              >
                <Mouse className="h-4 w-4 text-white/50 animate-scroll-hint" />
                <p className="text-[10px] uppercase tracking-[0.55em] text-white/40">
                  scroll or click to begin
                </p>
              </div>
            </section>

            {/* Bottom horizon glow */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-72 bg-linear-to-t from-[oklch(0.18_0.18_300/0.45)] via-[oklch(0.1_0.1_280/0.15)] to-transparent" />
          </motion.div>
        )}

        {/* ═══════════ PHASE 2: WARP TRANSITION ═══════════════ */}
        {phase === "warp" && (
          <motion.div key="warp" className="relative h-screen w-screen">
            <WarpTransition onComplete={handleWarpComplete} />
          </motion.div>
        )}

        {/* ═══════════ PHASE 3: MEMORY HUB ═══════════════════ */}
        {phase === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-screen w-screen"
            style={{ transformOrigin: "50% 50%" }}
          >
            <Suspense
              fallback={
                <div
                  className="flex h-screen w-screen items-center justify-center"
                  style={{ background: "#030112" }}
                >
                  <motion.p
                    className="text-xs tracking-[0.4em] uppercase"
                    style={{ color: "rgba(196,160,255,0.5)" }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    entering the universe…
                  </motion.p>
                </div>
              }
            >
              <HubScene />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
