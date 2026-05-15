import type { MemoryItem } from "@/types/memory";

/**
 * 30 memory entries arranged across 4 rows on the curved dome wall.
 *
 * Each entry uses a seeded picsum.photos URL for consistent placeholder
 * portraits. Replace the `image` field with real photo paths later.
 *
 * Position angles are spread across a 150° arc so the wall wraps
 * around the viewer like a cinematic IMAX theater.
 */


const IMAGE_PATHS: string[] = [
  "/images/memories/IMG-20250911-WA0015.jpg.jpeg",
  "/images/memories/IMG_20240227_230957.jpg.jpeg",
  "/images/memories/IMG_20250323_194350.jpg.jpeg",
  "/images/memories/IMG_20250821_202354_613.jpg.jpeg",
  "/images/memories/IMG_20260515_150716.jpg.jpeg",
  "/images/memories/IMG_20260515_170257.jpg.jpeg",
  "/images/memories/IMG_20260515_170652.jpg.jpeg",
  "/images/memories/sarmi0117-20241108-0001.jpg.jpeg",
  "/images/memories/Screenshot_20230515_184643.jpg.jpeg",
  "/images/memories/Screenshot_20250804_165628.jpg.jpeg",
  "/images/memories/Screenshot_20250804_165656.jpg.jpeg",
  "/images/memories/Snapchat-1010608904.jpg.jpeg",
  "/images/memories/Snapchat-1086314787.jpg.jpeg",
  "/images/memories/Snapchat-1120686485.jpg.jpeg",
  "/images/memories/Snapchat-1138553002.jpg.jpeg",
  "/images/memories/Snapchat-1181971729.jpg.jpeg",
  "/images/memories/Snapchat-121309602.jpg.jpeg",
  "/images/memories/Snapchat-1335013779.jpg.jpeg",
  "/images/memories/Snapchat-1364888989.jpg.jpeg",
  "/images/memories/Snapchat-1428709762.jpg.jpeg",
  "/images/memories/Snapchat-1430459680.jpg.jpeg",
  "/images/memories/Snapchat-1435620303.jpg.jpeg",
  "/images/memories/Snapchat-1510696965.jpg.jpeg",
  "/images/memories/Snapchat-1579124941.jpg.jpeg",
  "/images/memories/Snapchat-1604798688.jpg.jpeg",
  "/images/memories/Snapchat-1647978826.jpg.jpeg",
  "/images/memories/Snapchat-171710196.jpg.jpeg",
  "/images/memories/Snapchat-176833751.jpg.jpeg",
  "/images/memories/Snapchat-1771679164.jpg.jpeg",
  "/images/memories/Snapchat-1900773388.jpg.jpeg",
  "/images/memories/Snapchat-1967494910.jpg.jpeg",
  "/images/memories/Snapchat-1985448532.jpg.jpeg",
  "/images/memories/Snapchat-2045938355.jpg.jpeg",
  "/images/memories/Snapchat-221831737.jpg.jpeg",
  "/images/memories/Snapchat-225413318.jpg.jpeg",
  "/images/memories/Snapchat-258938805.jpg.jpeg",
  "/images/memories/Snapchat-34295088.jpg.jpeg",
  "/images/memories/Snapchat-355593163.jpg.jpeg",
  "/images/memories/Snapchat-488272511.jpg.jpeg",
  "/images/memories/Snapchat-520780322.jpg.jpeg",
  "/images/memories/Snapchat-699407617.jpg.jpeg",
  "/images/memories/Snapchat-709907990.jpg.jpeg",
  "/images/memories/Snapchat-711575241.jpg.jpeg",
  "/images/memories/Snapchat-749875963.jpg.jpeg",
  "/images/memories/Snapchat-83965792.jpg.jpeg",
  "/images/memories/Snapchat-881010374.jpg.jpeg",
  "/images/memories/Snapchat-894451949.jpg.jpeg",
  "/images/memories/Snapchat-907905043.jpg.jpeg",
  "/images/memories/Snapchat-973753963.jpg.jpeg",
  "/images/memories/Snapchat-990245786.jpg.jpeg",
];

const CAPTIONS = [
  "The first time everything made sense.",
  "A laugh that echoed through forever.",
  "Golden hour, golden heart.",
  "Your smile lit up the whole sky.",
  "This moment lives rent-free in my heart.",
  "Tiny moment, infinite feeling.",
  "We didn't need words here.",
  "A quiet kind of magic.",
  "The stars were jealous that night.",
  "Some memories glow brighter than the sun.",
  "You made ordinary feel extraordinary.",
  "Every pixel holds a universe.",
  "The kind of peace I keep searching for.",
  "Lost in the best way possible.",
  "A chapter I'll never stop rereading.",
  "Time stood still, just for us.",
  "This is what happy looks like.",
  "A heartbeat frozen in a frame.",
  "The beginning of something beautiful.",
  "We were infinite in that moment.",
  "Soft light, softer memories.",
  "A wish whispered to the wind.",
  "Dancing through the chaos together.",
  "Your eyes held entire galaxies.",
  "The soundtrack of my favourite day.",
  "Holding onto this one forever.",
  "Sunshine wrapped in a photograph.",
  "A love letter in pixel form.",
  "The world disappeared and it was just us.",
  "Every detail etched into my soul.",
  "Proof that magic is real.",
  "A bridge between then and always.",
  "The universe conspired for this moment.",
  "Warmth that no winter could touch.",
  "Laughter like windchimes in spring.",
  "A polaroid of pure joy.",
  "Breathless and blissful.",
  "You were the plot twist I needed.",
  "Written in stardust and sealed with a smile.",
  "A constellation of our best moments.",
  "Still can't believe this was real.",
  "The calm in my beautiful storm.",
  "Adventure looks good on us.",
  "This memory has its own heartbeat.",
  "Where time bends around happiness.",
  "The glow that never fades.",
  "A story told in one glance.",
  "My favourite shade of 'us'.",
  "The echo of something eternal.",
  "And the universe whispered 'remember this'.",
];

const DATES = [
  "Jan 12, 2021", "Mar 05, 2021", "May 18, 2021", "Jul 22, 2021", "Sep 03, 2021",
  "Nov 14, 2021", "Feb 08, 2022", "Apr 19, 2022", "Jun 30, 2022", "Aug 11, 2022",
  "Oct 25, 2022", "Dec 06, 2022", "Jan 28, 2023", "Mar 15, 2023", "May 09, 2023",
  "Jul 01, 2023", "Aug 24, 2023", "Oct 12, 2023", "Dec 31, 2023", "Feb 14, 2024",
  "Apr 07, 2024", "May 22, 2024", "Jul 16, 2024", "Sep 08, 2024", "Nov 03, 2024",
  "Jan 05, 2022", "Mar 20, 2022", "Jun 11, 2022", "Aug 29, 2022", "Nov 18, 2022",
  "Feb 02, 2023", "Apr 25, 2023", "Jul 08, 2023", "Sep 19, 2023", "Nov 27, 2023",
  "Jan 14, 2024", "Mar 30, 2024", "Jun 05, 2024", "Aug 18, 2024", "Oct 22, 2024",
  "Dec 09, 2021", "Feb 25, 2022", "May 06, 2022", "Jul 17, 2022", "Sep 28, 2022",
  "Dec 13, 2022", "Mar 03, 2023", "Jun 18, 2023", "Aug 05, 2023", "Oct 30, 2023",
];

const ROWS = 5;
const COLS_PER_ROW = [10, 10, 9, 10, 9]; // 48 total
const ARC_SPAN = 180; // degrees — deeper concave IMAX wraparound

function buildMemories(): MemoryItem[] {
  const items: MemoryItem[] = [];
  let idx = 0;

  for (let row = 0; row < ROWS; row++) {
    const cols = COLS_PER_ROW[row];
    const startAngle = -ARC_SPAN / 2;
    const step = ARC_SPAN / (cols - 1);

    for (let col = 0; col < cols; col++) {
      const angle = startAngle + col * step;
      // Subtle organic offsets — enough life without chaos
      const jitterAngle = Math.sin(idx * 3.7) * 0.8;
      const rotation = Math.sin(idx * 2.3) * 1.5 + Math.cos(idx * 1.7) * 0.8;
      const depth = Math.sin(idx * 1.1) * 5 + Math.cos(idx * 0.7) * 3;

      items.push({
        id: `mem-${idx}`,
        image: IMAGE_PATHS[idx % IMAGE_PATHS.length],
        caption: CAPTIONS[idx % CAPTIONS.length],
        date: DATES[idx % DATES.length],
        rotation,
        depth,
        position: {
          row,
          col,
          angle: angle + jitterAngle,
        },
      });
      idx++;
    }
  }

  return items;
}

export const MEMORIES: MemoryItem[] = buildMemories();

/** Total arc span in degrees */
export const DOME_ARC_SPAN = ARC_SPAN;

/** Number of rows */
export const DOME_ROWS = ROWS;
