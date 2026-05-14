import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

import { Experience } from "@/scenes/Experience";
import { HubOverlay } from "@/components/HubOverlay";
import { useLenis } from "@/hooks/useLenis";
import { MemoryPlanetScene } from "@/scenes/MemoryPlanetScene";
import { MemoryDome } from "@/memory/MemoryDome";

/**
 * HubScene — the top-level "page" component that wires
 * the fullscreen R3F canvas + HTML overlay together.
 *
 * Lenis is initialised here for smooth scrolling on the
 * broader page if content extends beyond the viewport.
 */
export const HubScene = () => {
  useLenis();
  const navigate = useNavigate();
  const [view, setView] = useState<"hub" | "memory" | "dome">("hub");
  const [enteringMemory, setEnteringMemory] = useState(false);
  const [enteringStudio, setEnteringStudio] = useState(false);
  const enterTimerRef = useRef<number | null>(null);
  const studioTimerRef = useRef<number | null>(null);

  const handleMemoryPlanet = useCallback(() => {
    if (view !== "hub" || enteringMemory) return;
    setEnteringMemory(true);
    enterTimerRef.current = window.setTimeout(() => {
      setView("dome");
    }, 1100);
  }, [enteringMemory, view]);

  const handleSecretCrystal = useCallback(() => {
    if (view !== "hub" || enteringMemory || enteringStudio) return;
    setEnteringStudio(true);
    studioTimerRef.current = window.setTimeout(() => {
      navigate({ to: "/cosmic-gallery" });
    }, 1200);
  }, [enteringMemory, enteringStudio, navigate, view]);

  useEffect(() => {
    return () => {
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      if (studioTimerRef.current) window.clearTimeout(studioTimerRef.current);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: "#030112" }}>
      <AnimatePresence mode="wait">
        {view === "hub" && (
          <motion.div
            key="hub"
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: "blur(10px)" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── Three.js canvas ─────────────────────────────── */}
            <Canvas
              className="absolute inset-0"
              camera={{ position: [0, 0.2, 12], fov: 52, near: 0.1, far: 250 }}
              dpr={[1, 1.5]}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
                toneMapping: 3, // ACESFilmic
                toneMappingExposure: 1.25,
              }}
              style={{ background: "#030112" }}
            >
              <Suspense fallback={null}>
                <Experience
                  onMemoryPlanet={handleMemoryPlanet}
                  onSecretCrystal={handleSecretCrystal}
                />
                <Preload all />
              </Suspense>
            </Canvas>

            {/* ── HTML overlay layer ─────────────────────────── */}
            <HubOverlay />

            {enteringMemory && (
              <motion.div
                className="absolute inset-0 z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(220,180,255,0.3), rgba(6,2,20,0.9) 70%)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              />
            )}

            {enteringStudio && (
              <motion.div
                className="absolute inset-0 z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background:
                    "radial-gradient(circle at 40% 50%, rgba(80,60,120,0.2), rgba(3,1,18,0.92) 70%)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              />
            )}
          </motion.div>
        )}

        {view === "memory" && (
          <motion.div
            key="memory"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <MemoryPlanetScene
              onExit={() => {
                setEnteringMemory(false);
                setView("hub");
              }}
            />
          </motion.div>
        )}

        {view === "dome" && (
          <motion.div
            key="dome"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <MemoryDome
              onExit={() => {
                setEnteringMemory(false);
                setView("hub");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
