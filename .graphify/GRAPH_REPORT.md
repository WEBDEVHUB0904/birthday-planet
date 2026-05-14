# Graph Report - .  (2026-05-14)

## Corpus Check
- cluster-only mode - file stats not available

## Summary
- 221 nodes · 250 edges · 7 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `animate()` - 5 edges
2. `normalizeCatastrophicSsrResponse()` - 4 edges
3. `fetch()` - 4 edges
4. `brandedErrorResponse()` - 3 edges
5. `Spiral Galaxy` - 3 edges
6. `Person - Serene` - 3 edges
7. `Person - Thoughtful` - 3 edges
8. `clamp()` - 2 edges
9. `lerp()` - 2 edges
10. `easeInOutCubic()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (20): Magenta & Pink Palette, Joy & Happiness, Peace & Serenity, Heart Emojis, Person - Joyful, Warm Lighting, Dark Pink Lipstick, Person - Serene (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.19
Nodes (5): animate(), clamp(), easeInOutCubic(), easeOutCubic(), lerp()

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (2): clamp(), onWheel()

### Community 8 - "Community 8"
Cohesion: 0.36
Nodes (5): brandedErrorResponse(), fetch(), getServerEntry(), isCatastrophicSsrErrorBody(), normalizeCatastrophicSsrResponse()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (5): Blue Stars, Magenta Nebula, Planet, Spiral Galaxy, Cosmic Journey

### Community 16 - "Community 16"
Cohesion: 1
Nodes (1): Space Setting

### Community 18 - "Community 18"
Cohesion: 1
Nodes (1): Door Background

## Knowledge Gaps
- **9 isolated node(s):** `Planet`, `Space Setting`, `Dark Pink Lipstick`, `Warm Lighting`, `Glasses` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 6`** (2 nodes): `clamp()`, `onWheel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `Space Setting`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `Door Background`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 5 inferred relationships involving `Love & Affection` (e.g. with `Stuffed Reindeer` and `Red Background`) actually correct?**
  _`Love & Affection` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Magenta & Pink Palette` (e.g. with `Floral Dress` and `Love & Affection`) actually correct?**
  _`Magenta & Pink Palette` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Planet`, `Space Setting`, `Dark Pink Lipstick` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._