"use client";

import { useState } from "react";

type Player = "X" | "O";

type CellValue = Player | null;

function calculateWinner(cells: CellValue[]): Player | null {
  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of winningLines) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }

  return null;
}

import type { ReactElement } from "react";

export default function TicTacToe(): ReactElement {
  const [cells, setCells] = useState<CellValue[]>(Array<CellValue>(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);

  const winner = calculateWinner(cells);
  const isBoardFull = cells.every((cell) => cell !== null);
  const isDraw = !winner && isBoardFull;

  function handleCellClick(index: number): void {
    if (cells[index] || winner) {
      return;
    }

    const nextCells = cells.slice();
    nextCells[index] = isXNext ? "X" : "O";
    setCells(nextCells);
    setIsXNext(!isXNext);
  }

  function handleReset(): void {
    setCells(Array<CellValue>(9).fill(null));
    setIsXNext(true);
  }

  const statusLabel = winner
    ? `Победитель: ${winner}`
    : isDraw
    ? "Ничья"
    : `Ход: ${isXNext ? "X" : "O"}`;

  return (
    <section className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Крестики-нолики</h1>
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-black/20 backdrop-blur">
        <div className="text-center mb-4 text-base font-medium" aria-live="polite">
          {statusLabel}
        </div>
        <div
          className="grid grid-cols-3 gap-2"
          role="grid"
          aria-label="Игровое поле 3 на 3"
        >
          {cells.map((value, index) => {
            const isDisabled = Boolean(value) || Boolean(winner);
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleCellClick(index)}
                className="h-20 sm:h-24 rounded-lg border border-black/10 dark:border-white/15 flex items-center justify-center text-3xl font-bold transition-colors bg-white dark:bg-zinc-900 hover:bg-zinc-100 disabled:opacity-70 disabled:hover:bg-inherit"
                aria-label={`Клетка ${index + 1}${value ? `, занята ${value}` : ""}`}
                aria-disabled={isDisabled}
                disabled={isDisabled}
              >
                {value}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 hover:bg-zinc-100 text-sm font-medium"
          >
            Сбросить
          </button>
          <div className="text-sm text-black/60 dark:text-white/60">
            {winner || isDraw ? "Игра окончена" : "Игра продолжается"}
          </div>
        </div>
      </div>
    </section>
  );
}