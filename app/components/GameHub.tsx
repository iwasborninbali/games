"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import TicTacToe from "./TicTacToe";
import Snake from "./Snake";

type GameKey = "tictactoe" | "snake";

const gameTitle: Record<GameKey, string> = {
  tictactoe: "Крестики-нолики",
  snake: "Змейка",
};

export default function GameHub(): ReactElement {
  const [activeGame, setActiveGame] = useState<GameKey>("tictactoe");

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-center gap-2">
        {(["tictactoe", "snake"] as GameKey[]).map((key) => {
          const isActive = activeGame === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveGame(key)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background border-transparent"
                  : "bg-white dark:bg-zinc-900 border-black/10 dark:border-white/15 hover:bg-zinc-100"
              }`}
              aria-pressed={isActive}
            >
              {gameTitle[key]}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl">
        {activeGame === "tictactoe" ? <TicTacToe /> : <Snake />}
      </div>
    </div>
  );
}