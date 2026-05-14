import { useRef } from "react";
import { useGSAPReveal } from "@/hooks/useGSAPReveal";
import { FloatingGlassCard } from "@/components/ui/FloatingGlassCard";

interface VideoAtmosphereProps {
  videoSrc: string;
}

export const VideoAtmosphere = ({ videoSrc }: VideoAtmosphereProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useGSAPReveal(sectionRef, { y: 28, duration: 1.2 });

  return (
    <section ref={sectionRef} className="cg-video">
      <video
        className="cg-video__media"
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="cg-video__overlay" />
      <div className="cg-video__glass" />
      <div className="cg-video__content" data-reveal>
        <FloatingGlassCard className="cg-video__card">
          <p>Even the silence feels like music.</p>
        </FloatingGlassCard>
      </div>
    </section>
  );
};
