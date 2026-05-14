/**
 * MemoryPath — Glowing constellation-style connection lines
 * between memory sections within the dome.
 *
 * Pure SVG + CSS. No canvas, no Three.js.
 * Curves glow with white/purple/pink gradients and pulse gently.
 */
export const MemoryPath = () => {
  return (
    <div className="memory-path" aria-hidden="true">
      <svg
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="memory-path__svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Primary glow gradient */}
          <linearGradient id="pathGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(200, 160, 255, 0)" />
            <stop offset="20%" stopColor="rgba(200, 160, 255, 0.5)" />
            <stop offset="50%" stopColor="rgba(255, 180, 230, 0.6)" />
            <stop offset="80%" stopColor="rgba(200, 160, 255, 0.5)" />
            <stop offset="100%" stopColor="rgba(200, 160, 255, 0)" />
          </linearGradient>

          {/* Secondary — more subtle */}
          <linearGradient id="pathGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="30%" stopColor="rgba(255, 255, 255, 0.2)" />
            <stop offset="50%" stopColor="rgba(220, 180, 255, 0.35)" />
            <stop offset="70%" stopColor="rgba(255, 255, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>

          {/* Blur filter for glow */}
          <filter id="pathBlur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="pathBlurWide">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Wide outer glow */}
        <path
          d="M 50,200 C 200,150 350,350 500,280 C 650,210 750,400 900,320 C 1050,240 1100,380 1150,350"
          stroke="url(#pathGrad1)"
          strokeWidth="6"
          filter="url(#pathBlurWide)"
          className="memory-path__line memory-path__line--slow"
        />

        {/* Mid glow */}
        <path
          d="M 50,200 C 200,150 350,350 500,280 C 650,210 750,400 900,320 C 1050,240 1100,380 1150,350"
          stroke="url(#pathGrad1)"
          strokeWidth="2"
          filter="url(#pathBlur)"
          className="memory-path__line memory-path__line--mid"
        />

        {/* Core bright line */}
        <path
          d="M 50,200 C 200,150 350,350 500,280 C 650,210 750,400 900,320 C 1050,240 1100,380 1150,350"
          stroke="url(#pathGrad2)"
          strokeWidth="1"
          className="memory-path__line memory-path__line--core"
        />

        {/* Second constellation path */}
        <path
          d="M 100,550 C 250,480 400,600 550,520 C 700,440 850,580 1000,500 C 1080,460 1120,530 1150,510"
          stroke="url(#pathGrad1)"
          strokeWidth="4"
          filter="url(#pathBlurWide)"
          className="memory-path__line memory-path__line--slow"
          style={{ animationDelay: "1.5s" }}
        />
        <path
          d="M 100,550 C 250,480 400,600 550,520 C 700,440 850,580 1000,500 C 1080,460 1120,530 1150,510"
          stroke="url(#pathGrad2)"
          strokeWidth="1"
          className="memory-path__line memory-path__line--core"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Connector dots at key intersections */}
        {[
          [500, 280],
          [900, 320],
          [550, 520],
          [1000, 500],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="3"
            fill="rgba(220, 190, 255, 0.6)"
            filter="url(#pathBlur)"
            className="memory-path__dot"
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}
      </svg>
    </div>
  );
};
