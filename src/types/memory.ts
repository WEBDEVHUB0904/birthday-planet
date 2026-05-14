/** Position on the curved dome wall */
export interface MemoryPosition {
  /** Row index (0-based) */
  row: number;
  /** Column index within the row */
  col: number;
  /** Angle in degrees on the cylindrical arc */
  angle: number;
}

/** A single memory entry */
export interface MemoryItem {
  id: string;
  image: string;
  caption: string;
  date: string;
  /** Slight random tilt in degrees for organic feel */
  rotation: number;
  /** Z-offset for layered depth parallax */
  depth: number;
  /** Placement on the curved wall */
  position: MemoryPosition;
  /** Optional thematic category */
  category?: string;
}

/** Props for the root MemoryDome component */
export interface MemoryDomeProps {
  onExit: () => void;
}

/** Props for an individual MemoryCard */
export interface MemoryCardProps {
  memory: MemoryItem;
  index: number;
  onSelect: (memory: MemoryItem) => void;
}

/** Data passed to the fullscreen modal */
export interface MemoryModalData {
  memory: MemoryItem;
  onClose: () => void;
}
