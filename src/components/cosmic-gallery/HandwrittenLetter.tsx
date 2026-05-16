import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import { useGSAPReveal } from "@/hooks/useGSAPReveal";

gsap.registerPlugin(ScrollTrigger);

export const HandwrittenLetter = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const vivusRef = useRef<any>(null);

  useGSAPReveal(sectionRef, { y: 24, duration: 1.1 });

  useEffect(() => {
    if (!svgRef.current || !sectionRef.current) return;

    let trigger: ScrollTrigger | null = null;

    const initVivus = async () => {
      // @ts-ignore
      const VivusModule = await import("vivus/dist/vivus.min.js");

      const Vivus =
        VivusModule.default || VivusModule;

      vivusRef.current = new Vivus(svgRef.current, {
        duration: 160,
        type: "oneByOne",
        start: "manual",
      });

      trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => vivusRef.current?.play(1),
        onLeaveBack: () => vivusRef.current?.stop().reset(),
      });
    };

    initVivus();

    return () => {
      trigger?.kill();

      if (vivusRef.current) {
        vivusRef.current.stop();
        vivusRef.current.destroy();
        vivusRef.current = null;
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="cg-letter">
      <div className="cg-letter__paper" />

      <div className="cg-letter__content" data-reveal-group>
        <p className="cg-letter__label" data-reveal-item>
          a letter that was never meant to be read
        </p>

        <h2 className="cg-letter__title" data-reveal-item>
          I don't think you realize
          <br />
          how permanently you've existed inside my universe.
        </h2>

        <p className="cg-letter__body" data-reveal-item>
          Before you, the days moved without weight. After you,
          every small thing carried a second meaning. I didn't
          plan this. I don't think anyone plans something like
          this. It just happened — quietly, irrevocably,
          like gravity.
        </p>

        <div className="cg-letter__ink" data-reveal-item>
          <svg
            ref={svgRef}
            className="cg-letter__svg"
            viewBox="0 0 720 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 140 C80 80, 140 80, 200 140 S320 200, 380 140 S500 80, 560 140 S640 200, 700 120"
              stroke="#3a2548"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <path
              d="M40 110 C110 50, 190 60, 240 110 S340 160, 420 110 S520 50, 600 110"
              stroke="#4a2e57"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>

          <span
            className="cg-letter__ink-spread"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
};