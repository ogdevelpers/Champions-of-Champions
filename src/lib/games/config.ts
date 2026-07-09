export const GAMES_CLOSED_HEADLINE = "🎬 Stay tuned!";

export const GAMES_CLOSED_MESSAGE = "The next challenge goes live tomorrow at 11:00 AM.";

export const EVENT_SCHEDULE_HEADLINE = "🎬 Stay tuned!";

export const EVENT_SCHEDULE_MESSAGE = "The event is on 15th July 2026 at 5:15 PM.";

export type GameId = "guess-actor" | "memory" | "dubsmash";

export const GAME_AVAILABILITY: Record<GameId, boolean> = {
  "guess-actor": false,
  memory: true,
  dubsmash: false,
};

export function isGameOpen(gameId: GameId): boolean {
  return GAME_AVAILABILITY[gameId] ?? false;
}

export function hasOpenGames(): boolean {
  return Object.values(GAME_AVAILABILITY).some(Boolean);
}

/** @deprecated Use isGameOpen("guess-actor") or hasOpenGames() instead */
export const GAMES_WINDOW_OPEN = hasOpenGames();
