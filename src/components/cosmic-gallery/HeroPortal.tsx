import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAPReveal } from "@/hooks/useGSAPReveal";
import { GalaxyBackground } from "@/components/ui/GalaxyBackground";
import { AuroraText } from "@/components/ui/AuroraText";
import { GradientDivider } from "@/components/ui/GradientDivider";
import { GlowButton } from "@/components/ui/GlowButton";
import { BlurOrb } from "@/components/ui/BlurOrb";

gsap.registerPlugin(ScrollTrigger);

/* ── tiny canvas starfield ─────────────────────────────────────────── */
function useStarfield(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const stars: { x: number; y: number; r: number; a: number; speed: number }[] = [];
    const COUNT = 180;

    const resize = () => {
      cvs.width = cvs.offsetWidth * devicePixelRatio;
      cvs.height = cvs.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      stars.push({
        x: Math.random() * cvs.offsetWidth,
        y: Math.random() * cvs.offsetHeight,
        r: 0.3 + Math.random() * 1.4,
        a: 0.15 + Math.random() * 0.7,
        speed: 0.08 + Math.random() * 0.18,
      });
    }

    let angle = 0;
    const draw = () => {
      const w = cvs.offsetWidth;
      const h = cvs.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      angle += 0.00012;

      const cx = w / 2;
      const cy = h / 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      for (const s of stars) {
        const dx = s.x - cx;
        const dy = s.y - cy;
        const rx = dx * cosA - dy * sinA + cx;
        const ry = dx * sinA + dy * cosA + cy;

        const twinkle = s.a * (0.6 + 0.4 * Math.sin(Date.now() * 0.001 * s.speed + s.x));
        ctx.beginPath();
        ctx.arc(rx, ry, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,190,255,${twinkle})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

/* ── component ─────────────────────────────────────────────────────── */
export const HeroPortal = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useGSAPReveal(sectionRef, { y: 30, duration: 1.4 });
  useStarfield(canvasRef);

  /* ── mouse parallax ──────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty("--hx", `${x}`);
      el.style.setProperty("--hy", `${y}`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(".cg-hero__media", {
        scale: 1.06,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".cg-hero__content", {
        y: -40,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        drift: 14 + Math.random() * 18,
        delay: Math.random() * 6,
        opacity: 0.2 + Math.random() * 0.35,
      })),
    [],
  );

  return (
    <section
      ref={sectionRef}
      className="cg-hero"
      style={{ "--hx": "0", "--hy": "0" } as React.CSSProperties}
    >
      {/* ── background layers ──────────────────────────────────── */}
      <div className="cg-hero__media">
        <GalaxyBackground density="hero" />
        <canvas ref={canvasRef} className="cg-hero__starfield" aria-hidden="true" />

        {/* Liquid ether — organic flowing atmosphere */}
        <div className="cg-hero__ether" aria-hidden="true" />

        {/* Cinematic fog layers */}
        <div className="cg-hero__fog" aria-hidden="true" />
        <div className="cg-hero__fog cg-hero__fog--alt" aria-hidden="true" />

        <div className="cg-hero__aurora" aria-hidden="true" />
        <div className="cg-hero__glow" aria-hidden="true" />
        <div className="cg-hero__nebula-pulse" aria-hidden="true" />
        <div className="cg-hero__light-rays" aria-hidden="true" />
        <div className="cg-hero__vignette" aria-hidden="true" />
        <div className="cg-hero__grain" aria-hidden="true" />
        <div className="cg-hero__particles" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className="cg-particle"
              style={{
                top: `${p.top}%`,
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animationDuration: `${p.drift}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── content ────────────────────────────────────────────── */}
      <div
        className="cg-hero__content cg-hero__content--breathing"
        data-reveal-group
        style={{
          transform: "translate3d(calc(var(--hx) * -8px), calc(var(--hy) * -5px), 0)",
          transition: "transform 1.8s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <p className="cg-hero__label" data-reveal-item>
          a protected archive of unspoken things
        </p>
        <AuroraText as="h1" className="cg-hero__title" data-reveal-item>
          Some people become permanent, even in silence.
        </AuroraText>
        <p className="cg-hero__subtitle" data-reveal-item>
          This is where I kept the parts of you that time couldn't reach.
        </p>
        <GradientDivider className="cg-hero__divider" />
        <div className="cg-hero__actions" data-reveal-item>
          <GlowButton>Enter the gallery</GlowButton>
        </div>
      </div>

      {/* ── decorative ─────────────────────────────────────────── */}
      <div
        className="cg-hero__decor"
        aria-hidden="true"
        style={{
          transform: "translate3d(calc(var(--hx) * -14px), calc(var(--hy) * -10px), 0)",
          transition: "transform 2.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <BlurOrb size={220} x="12%" y="26%" opacity={0.35} />
        <BlurOrb size={280} x="78%" y="18%" opacity={0.3} />
        <BlurOrb size={160} x="50%" y="70%" opacity={0.2} />
      </div>

      {/* ── scroll indicator ───────────────────────────────────── */}
      <div className="cg-scroll" data-reveal>
        <span className="cg-scroll__line" />
        <span className="cg-scroll__text">scroll to enter</span>
      </div>
    </section>
  );
};
