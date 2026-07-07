export interface MemoryTile {
  id: string;
  label: string;
  imageUrl: string;
}

export const MEMORY_TILES: MemoryTile[] = [
  { id: "customer-first", label: "Customer First", imageUrl: "/memory/customer-first.png" },
  { id: "integrity", label: "Integrity", imageUrl: "/memory/integrity.png" },
  { id: "people", label: "People", imageUrl: "/memory/people.png" },
  { id: "empathy", label: "Empathy", imageUrl: "/memory/empathy.png" },
  { id: "performance", label: "Performance", imageUrl: "/memory/performance.png" },
  { id: "passion", label: "Passion", imageUrl: "/memory/passion.png" },
];

export function createShuffledDeck(): {
  pairId: string;
  uniqueId: string;
  label: string;
  imageUrl: string;
}[] {
  const pairs = MEMORY_TILES.flatMap((tile) => [
    { pairId: tile.id, uniqueId: `${tile.id}-a`, label: tile.label, imageUrl: tile.imageUrl },
    { pairId: tile.id, uniqueId: `${tile.id}-b`, label: tile.label, imageUrl: tile.imageUrl },
  ]);

  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs;
}
