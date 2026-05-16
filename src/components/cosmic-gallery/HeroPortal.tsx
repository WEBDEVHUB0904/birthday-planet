// import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { useGSAPReveal } from "@/hooks/useGSAPReveal";
// import { GalaxyBackground } from "@/components/ui/GalaxyBackground";
// import { AuroraText } from "@/components/ui/AuroraText";
// import { GradientDivider } from "@/components/ui/GradientDivider";
// import { GlowButton } from "@/components/ui/GlowButton";
// import { BlurOrb } from "@/components/ui/BlurOrb";

// gsap.registerPlugin(ScrollTrigger);

// /* ── tiny canvas starfield ─────────────────────────────────────────── */
// function useStarfield(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
//   useEffect(() => {
//     const cvs = canvasRef.current;
//     if (!cvs) return;
//     const ctx = cvs.getContext("2d");
//     if (!ctx) return;

//     let raf = 0;
//     const stars: { x: number; y: number; r: number; a: number; speed: number }[] = [];
//     const COUNT = 180;

//     const resize = () => {
//       cvs.width = cvs.offsetWidth * devicePixelRatio;
//       cvs.height = cvs.offsetHeight * devicePixelRatio;
//       ctx.scale(devicePixelRatio, devicePixelRatio);
//     };
//     resize();
//     window.addEventListener("resize", resize);

//     for (let i = 0; i < COUNT; i++) {
//       stars.push({
//         x: Math.random() * cvs.offsetWidth,
//         y: Math.random() * cvs.offsetHeight,
//         r: 0.3 + Math.random() * 1.4,
//         a: 0.15 + Math.random() * 0.7,
//         speed: 0.08 + Math.random() * 0.18,
//       });
//     }

//     let angle = 0;
//     const draw = () => {
//       const w = cvs.offsetWidth;
//       const h = cvs.offsetHeight;
//       ctx.clearRect(0, 0, w, h);
//       angle += 0.00012;

//       const cx = w / 2;
//       const cy = h / 2;
//       const cosA = Math.cos(angle);
//       const sinA = Math.sin(angle);

//       for (const s of stars) {
//         const dx = s.x - cx;
//         const dy = s.y - cy;
//         const rx = dx * cosA - dy * sinA + cx;
//         const ry = dx * sinA + dy * cosA + cy;

//         const twinkle = s.a * (0.6 + 0.4 * Math.sin(Date.now() * 0.001 * s.speed + s.x));
//         ctx.beginPath();
//         ctx.arc(rx, ry, s.r, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(210,190,255,${twinkle})`;
//         ctx.fill();
//       }
//       raf = requestAnimationFrame(draw);
//     };
//     raf = requestAnimationFrame(draw);

//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener("resize", resize);
//     };
//   }, [canvasRef]);
// }

// /* ── component ─────────────────────────────────────────────────────── */
// export const HeroPortal = () => {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   useGSAPReveal(sectionRef, { y: 30, duration: 1.4 });
//   useStarfield(canvasRef);

//   /* ── mouse parallax ──────────────────────────────────────────────── */
//   useEffect(() => {
//     const el = sectionRef.current;
//     if (!el) return;
//     const onMove = (e: PointerEvent) => {
//       const x = (e.clientX / window.innerWidth - 0.5) * 2;
//       const y = (e.clientY / window.innerHeight - 0.5) * 2;
//       el.style.setProperty("--hx", `${x}`);
//       el.style.setProperty("--hy", `${y}`);
//     };
//     window.addEventListener("pointermove", onMove, { passive: true });
//     return () => window.removeEventListener("pointermove", onMove);
//   }, []);

//   useLayoutEffect(() => {
//     if (!sectionRef.current) return;

//     const ctx = gsap.context(() => {
//       gsap.to(".cg-hero__media", {
//         scale: 1.06,
//         scrollTrigger: {
//           trigger: sectionRef.current,
//           start: "top top",
//           end: "bottom top",
//           scrub: true,
//         },
//       });

//       gsap.to(".cg-hero__content", {
//         y: -40,
//         opacity: 0,
//         scrollTrigger: {
//           trigger: sectionRef.current,
//           start: "top top",
//           end: "bottom top",
//           scrub: true,
//         },
//       });
//     }, sectionRef);

//     return () => ctx.revert();
//   }, []);

//   const particles = useMemo(
//     () =>
//       Array.from({ length: 26 }, (_, i) => ({
//         id: i,
//         top: Math.random() * 100,
//         left: Math.random() * 100,
//         size: 2 + Math.random() * 3,
//         drift: 14 + Math.random() * 18,
//         delay: Math.random() * 6,
//         opacity: 0.2 + Math.random() * 0.35,
//       })),
//     [],
//   );

//   return (
//     <section
//       ref={sectionRef}
//       className="cg-hero"
//       style={{ "--hx": "0", "--hy": "0" } as React.CSSProperties}
//     >
//       {/* ── background layers ──────────────────────────────────── */}
//       <div className="cg-hero__media">
//         <GalaxyBackground density="hero" />
//         <canvas ref={canvasRef} className="cg-hero__starfield" aria-hidden="true" />

//         {/* Liquid ether — organic flowing atmosphere */}
//         <div className="cg-hero__ether" aria-hidden="true" />

//         {/* Cinematic fog layers */}
//         <div className="cg-hero__fog" aria-hidden="true" />
//         <div className="cg-hero__fog cg-hero__fog--alt" aria-hidden="true" />

//         <div className="cg-hero__aurora" aria-hidden="true" />
//         <div className="cg-hero__glow" aria-hidden="true" />
//         <div className="cg-hero__nebula-pulse" aria-hidden="true" />
//         <div className="cg-hero__light-rays" aria-hidden="true" />
//         <div className="cg-hero__vignette" aria-hidden="true" />
//         <div className="cg-hero__grain" aria-hidden="true" />
//         <div className="cg-hero__particles" aria-hidden="true">
//           {particles.map((p) => (
//             <span
//               key={p.id}
//               className="cg-particle"
//               style={{
//                 top: `${p.top}%`,
//                 left: `${p.left}%`,
//                 width: `${p.size}px`,
//                 height: `${p.size}px`,
//                 opacity: p.opacity,
//                 animationDuration: `${p.drift}s`,
//                 animationDelay: `${p.delay}s`,
//               }}
//             />
//           ))}
//         </div>
//       </div>

//       {/* ── content ────────────────────────────────────────────── */}
//       <div
//         className="cg-hero__content cg-hero__content--breathing"
//         data-reveal-group
//         style={{
//           transform: "translate3d(calc(var(--hx) * -8px), calc(var(--hy) * -5px), 0)",
//           transition: "transform 1.8s cubic-bezier(0.22,1,0.36,1)",
//         }}
//       >
//         <p className="cg-hero__label" data-reveal-item>
//           a protected archive of unspoken things
//         </p>
//         <AuroraText as="h1" className="cg-hero__title" data-reveal-item>
//           Some people become permanent, even in silence.
//         </AuroraText>
//         <p className="cg-hero__subtitle" data-reveal-item>
//           This is where I kept the parts of you that time couldn't reach.
//         </p>
//         <GradientDivider className="cg-hero__divider" />
//         <div className="cg-hero__actions" data-reveal-item>
//           <GlowButton>Enter the gallery</GlowButton>
//         </div>
//       </div>

//       {/* ── decorative ─────────────────────────────────────────── */}
//       <div
//         className="cg-hero__decor"
//         aria-hidden="true"
//         style={{
//           transform: "translate3d(calc(var(--hx) * -14px), calc(var(--hy) * -10px), 0)",
//           transition: "transform 2.2s cubic-bezier(0.22,1,0.36,1)",
//         }}
//       >
//         <BlurOrb size={220} x="12%" y="26%" opacity={0.35} />
//         <BlurOrb size={280} x="78%" y="18%" opacity={0.3} />
//         <BlurOrb size={160} x="50%" y="70%" opacity={0.2} />
//       </div>

//       {/* ── scroll indicator ───────────────────────────────────── */}
//       <div className="cg-scroll" data-reveal>
//         <span className="cg-scroll__line" />
//         <span className="cg-scroll__text">scroll to enter</span>
//       </div>
//     </section>
//   );
// };



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

/* ── Enhanced multicolor starfield with shooting stars ─────────────── */
function useStarfield(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    // Star colors — gold, rose, white, soft blue, violet
    const STAR_COLORS = [
      "255,255,255",
      "245,200,66",
      "255,107,157",
      "180,160,255",
      "120,180,255",
      "255,220,180",
    ];

    const stars: {
      x: number; y: number; r: number;
      a: number; speed: number; color: string;
      twinkleOffset: number;
    }[] = [];

    // Shooting stars
    const shoots: {
      x: number; y: number;
      vx: number; vy: number;
      len: number; alpha: number; active: boolean;
    }[] = Array.from({ length: 5 }, () => ({ x:0,y:0,vx:0,vy:0,len:0,alpha:0,active:false }));

    const COUNT = 220;

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
        r: 0.4 + Math.random() * 1.6,
        a: 0.2 + Math.random() * 0.75,
        speed: 0.06 + Math.random() * 0.2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    const spawnShoot = (s: typeof shoots[0]) => {
      const w = cvs.offsetWidth;
      const h = cvs.offsetHeight;
      s.x = Math.random() * w * 0.7;
      s.y = Math.random() * h * 0.4;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      const speed = 6 + Math.random() * 6;
      s.vx = Math.cos(angle) * speed;
      s.vy = Math.sin(angle) * speed;
      s.len = 80 + Math.random() * 80;
      s.alpha = 1;
      s.active = true;
    };

    // Stagger initial shoot spawns
    shoots.forEach((s, i) => {
      setTimeout(() => spawnShoot(s), i * 2800 + Math.random() * 2000);
    });

    let angle = 0;

    const draw = () => {
      const w = cvs.offsetWidth;
      const h = cvs.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      angle += 0.00008; // slower drift

      const cx = w / 2;
      const cy = h / 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const now = Date.now() * 0.001;

      // Draw stars
      for (const s of stars) {
        const dx = s.x - cx;
        const dy = s.y - cy;
        const rx = dx * cosA - dy * sinA + cx;
        const ry = dx * sinA + dy * cosA + cy;
        const twinkle = s.a * (0.5 + 0.5 * Math.sin(now * s.speed + s.twinkleOffset));

        // Glow for brighter stars
        if (s.r > 1.2) {
          const grd = ctx.createRadialGradient(rx, ry, 0, rx, ry, s.r * 3);
          grd.addColorStop(0, `rgba(${s.color},${twinkle * 0.6})`);
          grd.addColorStop(1, `rgba(${s.color},0)`);
          ctx.beginPath();
          ctx.arc(rx, ry, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(rx, ry, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${twinkle})`;
        ctx.fill();
      }

      // Draw shooting stars
      for (const s of shoots) {
        if (!s.active) continue;
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.018;

        if (s.alpha <= 0) {
          s.active = false;
          setTimeout(() => spawnShoot(s), 3000 + Math.random() * 4000);
          continue;
        }

        const tailX = s.x - s.vx * (s.len / 8);
        const tailY = s.y - s.vy * (s.len / 8);
        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(0.7, `rgba(245,200,66,${s.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(255,255,255,${s.alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
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

  /* ── mouse parallax ── */
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

  /* ── Dramatic entrance + scroll animations ── */
  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {

      // Staggered content entrance
      gsap.fromTo(
        "[data-reveal-item]",
        { y: 60, opacity: 0, filter: "blur(14px)" },
        {
          y: 0, opacity: 1, filter: "blur(0px)",
          duration: 1.6,
          ease: "expo.out",
          stagger: 0.18,
          delay: 0.3,
        }
      );

      // Scroll — background parallax scale
      gsap.to(".cg-hero__media", {
        scale: 1.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Scroll — content floats up and fades
      gsap.to(".cg-hero__content", {
        y: -60,
        opacity: 0,
        filter: "blur(8px)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "60% top",
          scrub: 1.2,
        },
      });

      // Scroll — orbs drift separately (deeper parallax)
      gsap.to(".cg-hero__decor", {
        y: -30,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 2,
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // More particles, with color variation via inline rgba
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => {
      const palette = [
        "rgba(245,200,66,",   // gold
        "rgba(255,107,157,",  // rose
        "rgba(180,160,255,",  // violet
        "rgba(255,255,255,",  // white
        "rgba(120,200,255,",  // blue
      ];
      const color = palette[i % palette.length];
      return {
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1.5 + Math.random() * 3,
        drift: 12 + Math.random() * 20,
        delay: Math.random() * 8,
        opacity: 0.15 + Math.random() * 0.45,
        color,
      };
    }), []);

  return (
    <section
      ref={sectionRef}
      className="cg-hero"
      style={{ "--hx": "0", "--hy": "0" } as React.CSSProperties}
    >
      {/* ── background layers — unchanged class names ── */}
      <div className="cg-hero__media">
        <GalaxyBackground density="hero" />
        <canvas ref={canvasRef} className="cg-hero__starfield" aria-hidden="true" />
        <div className="cg-hero__ether" aria-hidden="true" />
        <div className="cg-hero__fog" aria-hidden="true" />
        <div className="cg-hero__fog cg-hero__fog--alt" aria-hidden="true" />
        <div className="cg-hero__aurora" aria-hidden="true" />
        <div className="cg-hero__glow" aria-hidden="true" />
        <div className="cg-hero__nebula-pulse" aria-hidden="true" />
        <div className="cg-hero__light-rays" aria-hidden="true" />
        <div className="cg-hero__vignette" aria-hidden="true" />
        <div className="cg-hero__grain" aria-hidden="true" />

        {/* Colorful particles */}
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
                background: `${p.color}0.8)`,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}0.5)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── content — unchanged ── */}
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

      {/* ── decorative orbs — unchanged ── */}
      <div
        className="cg-hero__decor"
        aria-hidden="true"
        style={{
          transform: "translate3d(calc(var(--hx) * -14px), calc(var(--hy) * -10px), 0)",
          transition: "transform 2.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <BlurOrb size={280} x="8%"  y="20%" opacity={0.45} />
        <BlurOrb size={340} x="75%" y="12%" opacity={0.38} />
        <BlurOrb size={200} x="50%" y="68%" opacity={0.28} />
        <BlurOrb size={180} x="30%" y="55%" opacity={0.2}  />
      </div>

      {/* ── scroll indicator — unchanged ── */}
      <div className="cg-scroll" data-reveal>
        <span className="cg-scroll__line" />
        <span className="cg-scroll__text">scroll to enter</span>
      </div>
    </section>
  );
};