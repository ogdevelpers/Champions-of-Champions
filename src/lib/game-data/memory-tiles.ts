export interface MemoryTile {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

export const MEMORY_TILES: MemoryTile[] = [
  { id: "crown", emoji: "👑", label: "Customer First", color: "#e63946" },
  { id: "diamond", emoji: "💎", label: "Integrity", color: "#457b9d" },
  { id: "leaf", emoji: "🌿", label: "People", color: "#2a9d8f" },
  { id: "flower", emoji: "🌸", label: "Empathy", color: "#9b5de5" },
];

export function createShuffledDeck(): { pairId: string; uniqueId: string; emoji: string; label: string; color: string }[] {
  const pairs = MEMORY_TILES.flatMap((tile) => [
    { pairId: tile.id, uniqueId: `${tile.id}-a`, emoji: tile.emoji, label: tile.label, color: tile.color },
    { pairId: tile.id, uniqueId: `${tile.id}-b`, emoji: tile.emoji, label: tile.label, color: tile.color },
  ]);

  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs;
}
