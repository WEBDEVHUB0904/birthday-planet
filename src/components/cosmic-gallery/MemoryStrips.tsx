import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAPReveal } from "@/hooks/useGSAPReveal";
import { CinematicTitle } from "@/components/ui/CinematicTitle";
import memory01 from "@/assets/Snapchat-1181971729.jpg.jpeg";
import memory02 from "@/assets/Snapchat-1364888989.jpg.jpeg";
import memory03 from "@/assets/Snapchat-1428709762.jpg.jpeg";
import memory04 from "@/assets/Snapchat-171710196.jpg.jpeg";
import memory05 from "@/assets/Snapchat-225413318.jpg.jpeg";
import memory06 from "@/assets/Snapchat-749875963.jpg.jpeg";

gsap.registerPlugin(ScrollTrigger);

interface MemoryStripItem {
  id: number;
  eyebrow: string;
  headline: string;
  note: string;
  signature: string;
  date: string;
  image: string;
  rotation: number;
}

const memoryImages = [memory01, memory02, memory03, memory04, memory05, memory06];

const memoryData: Omit<MemoryStripItem, "id" | "image" | "rotation">[] = [
  {
    eyebrow: "the first weight",
    headline: "There was a moment before this — and a different version of me after.",
    note: "Some shifts are so quiet you only notice them when the whole sky has rearranged itself around one person.",
    signature: "— the beginning",
    date: "moment i",
  },
  {
    eyebrow: "golden hours",
    headline: "Even the silence carried something between us.",
    note: "We didn't name it. We didn't need to. The air knew before we did.",
    signature: "— in orbit",
    date: "moment ii",
  },
  {
    eyebrow: "the warmth",
    headline: "Some things stay glowing long after you stop looking.",
    note: "Like holding sunlight in your palms — warm, fleeting, impossible to let go of entirely.",
    signature: "— softly kept",
    date: "moment iii",
  },
  {
    eyebrow: "quiet gravity",
    headline: "Every version of the future somehow included you.",
    note: "A thousand different timelines, and in every single one — the same pull, the same impossible weight.",
    signature: "— written in silence",
    date: "moment iv",
  },
  {
    eyebrow: "tender constants",
    headline: "You became a permanent address inside my chest.",
    note: "Not a location, not coordinates — just wherever you happen to exist, I orbit.",
    signature: "— always near",
    date: "moment v",
  },
  {
    eyebrow: "infinite loop",
    headline: "I kept these memories where time couldn't reach them.",
    note: "Filed carefully between heartbeats. Stored in the softest corner of something I can't name.",
    signature: "— forever kept",
    date: "moment vi",
  },
];

const placeholderArt = (seed: number) => {
  const hue = 260 + (seed % 6) * 18;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='720' height='960'>
  <defs>
    <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
      <stop offset='0%' stop-color='hsl(${hue},60%,72%)'/>
      <stop offset='100%' stop-color='hsl(${hue + 20},60%,58%)'/>
    </linearGradient>
  </defs>
  <rect width='100%' height='100%' fill='url(#g)'/>
  <circle cx='220' cy='260' r='180' fill='hsla(${hue + 40},70%,80%,0.35)'/>
  <circle cx='520' cy='640' r='220' fill='hsla(${hue - 20},70%,70%,0.25)'/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/* fixed seed random for consistent rotations */
const seededRotations = [-1.8, 1.4, -0.6, 2.1, -1.2, 0.8, -2.0, 1.6];

export const MemoryStrips = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useGSAPReveal(sectionRef, { y: 30, duration: 1.1, stagger: 0.12 });

  const items = useMemo<MemoryStripItem[]>(() => {
    const total = Math.max(memoryData.length, memoryImages.length);
    return Array.from({ length: total }, (_, i) => {
      const data = memoryData[i] ?? memoryData[i % memoryData.length];
      return {
        id: i,
        ...data,
        image: memoryImages[i] ?? placeholderArt(i),
        rotation: seededRotations[i % seededRotations.length],
      };
    });
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const parallax = gsap.utils.toArray<HTMLElement>("[data-parallax]");
      parallax.forEach((el) => {
        gsap.to(el, {
          y: -28,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            scrub: true,
            start: "top bottom",
            end: "bottom top",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cg-strips">
      <div className="cg-strips__header" data-reveal>
        <CinematicTitle label="pages from a quiet archive" title="Fragments that refused to dissolve" />
      </div>

      <div className="cg-strips__list">
        {items.map((item, index) => (
          <article
            key={item.id}
            className={`cg-strip ${index % 2 === 0 ? "cg-strip--left" : "cg-strip--right"}`}
            data-reveal-group
          >
            <div className="cg-strip__media" data-parallax data-reveal-item>
              <div
                className="cg-strip__frame"
                style={{ "--card-rotation": `${item.rotation}deg` } as React.CSSProperties}
              >
                {/* Glow halo behind the frame */}
                <span className="cg-strip__glow-halo" aria-hidden="true" />
                <img
                  src={item.image}
                  alt={item.eyebrow}
                  loading="lazy"
                  decoding="async"
                  width={720}
                  height={960}
                  className="cg-strip__image"
                />
                {/* Film grain overlay */}
                <span className="cg-strip__film-grain" aria-hidden="true" />
                {/* Vignette edges */}
                <span className="cg-strip__vignette-edge" aria-hidden="true" />
                <span className="cg-strip__tape cg-strip__tape--top" aria-hidden="true" />
                <span className="cg-strip__tape cg-strip__tape--bottom" aria-hidden="true" />
                <span className="cg-strip__light-leak" aria-hidden="true" />
                <span className="cg-strip__date">{item.date}</span>
              </div>
            </div>
            <div className="cg-strip__text" data-reveal-item>
              <p className="cg-strip__eyebrow">{item.eyebrow}</p>
              <h3 className="cg-strip__headline">{item.headline}</h3>
              <p className="cg-strip__note">{item.note}</p>
              <span className="cg-strip__signature">{item.signature}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
