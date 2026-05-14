import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HeroPortal } from "@/components/cosmic-gallery/HeroPortal";
import { CinematicText } from "@/components/cosmic-gallery/CinematicText";
import { MemoryStrips } from "@/components/cosmic-gallery/MemoryStrips";
import { HandwrittenLetter } from "@/components/cosmic-gallery/HandwrittenLetter";
import { VideoAtmosphere } from "@/components/cosmic-gallery/VideoAtmosphere";
import { FinalReveal } from "@/components/cosmic-gallery/FinalReveal";
import { EmotionalBreather } from "@/components/cosmic-gallery/EmotionalBreather";
import { AtmosphereLayer } from "@/components/cosmic-gallery/AtmosphereLayer";
import { HandwrittenOverlay } from "@/components/cosmic-gallery/HandwrittenOverlay";
import { useLenisScroll } from "@/hooks/useLenisScroll";

export const CosmicGallery = () => {
  const navigate = useNavigate();
  useLenisScroll();

  const videoSrc = useMemo(() => "/videos/cosmic-gallery.mp4", []);

  return (
    <main className="cosmic-gallery">
      {/* ── persistent atmosphere ─────────────────────────────── */}
      <AtmosphereLayer />

      {/* ── back button ───────────────────────────────────────── */}
      <button
        type="button"
        className="cg-back"
        onClick={() => navigate({ to: "/", search: { enter: "hub" } })}
      >
        return to universe
      </button>

      {/* ── hero ──────────────────────────────────────────────── */}
      <HeroPortal />

      {/* ── cinematic interlude ───────────────────────────────── */}
      <CinematicText />

      {/* ── handwritten annotation ─────────────────────────────── */}
      <HandwrittenOverlay
        fragments={[
          { text: "I don't think you know", position: "right", delay: 0.2 },
          { text: "how much of you I carried", position: "left", delay: 0.8 },
        ]}
      />

      {/* ── breathing space ───────────────────────────────────── */}
      <EmotionalBreather
        line="You became a permanent address inside my chest."
        subline="Not a city. Not a room. Just the weight of remembering."
        annotation="— filed under: things I never said"
      />

      {/* ── memory cards ──────────────────────────────────────── */}
      <MemoryStrips />

      {/* ── handwritten annotation ─────────────────────────────── */}
      <HandwrittenOverlay
        fragments={[
          { text: "filed carefully between heartbeats", position: "center", delay: 0.3 },
        ]}
      />

      {/* ── breathing space ───────────────────────────────────── */}
      <EmotionalBreather
        line="I kept these memories where time couldn't reach them."
        annotation="— protected, always"
      />

      {/* ── handwritten letter ────────────────────────────────── */}
      <HandwrittenLetter />

      {/* ── handwritten annotation ─────────────────────────────── */}
      <HandwrittenOverlay
        fragments={[
          { text: "written but never sent", position: "right", delay: 0.5 },
          { text: "kept anyway", position: "left", delay: 1.2 },
        ]}
      />

      {/* ── video atmosphere ──────────────────────────────────── */}
      <VideoAtmosphere videoSrc={videoSrc} />

      {/* ── breathing space before ending ─────────────────────── */}
      <EmotionalBreather
        line="And when silence is all that's left…"
        subline="it still sounds like you."
        annotation="— in another universe, maybe"
      />

      {/* ── final reveal ──────────────────────────────────────── */}
      <FinalReveal />
    </main>
  );
};
