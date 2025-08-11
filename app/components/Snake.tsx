"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";

type Point = { x: number; y: number };

type Direction = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

const BOARD_COLS = 20;
const BOARD_ROWS = 20;
const CELL_SIZE = 18; // px
const INITIAL_SPEED_MS = 160;

function getRandomEmptyCell(occupied: Set<string>): Point {
  while (true) {
    const x = Math.floor(Math.random() * BOARD_COLS);
    const y = Math.floor(Math.random() * BOARD_ROWS);
    const key = `${x},${y}`;
    if (!occupied.has(key)) return { x, y };
  }
}

function draw(
  ctx: CanvasRenderingContext2D,
  snake: Point[],
  food: Point,
  isGameOver: boolean
): void {
  const width = BOARD_COLS * CELL_SIZE;
  const height = BOARD_ROWS * CELL_SIZE;

  // background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // grid (light)
  ctx.strokeStyle = "rgba(0,0,0,0.05)";
  for (let x = 0; x <= width; x += CELL_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += CELL_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // food
  ctx.fillStyle = "#ef4444"; // red
  ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

  // snake
  ctx.fillStyle = "#22c55e"; // green
  snake.forEach((segment, index) => {
    const padding = index === 0 ? 1 : 3;
    ctx.fillRect(
      segment.x * CELL_SIZE + padding,
      segment.y * CELL_SIZE + padding,
      CELL_SIZE - padding * 2,
      CELL_SIZE - padding * 2
    );
  });

  if (isGameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.textAlign = "center";
    ctx.fillText("Игра окончена", width / 2, height / 2);
  }
}

export default function Snake(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState<Point[]>([
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ]);
  const [direction, setDirection] = useState<Direction>("ArrowRight");
  const [pendingDirection, setPendingDirection] = useState<Direction | null>(null);
  const [food, setFood] = useState<Point>(() => getRandomEmptyCell(new Set(["8,10", "7,10", "6,10"])));
  const [running, setRunning] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(INITIAL_SPEED_MS);
  const [score, setScore] = useState<number>(0);

  const resetGame = useCallback(() => {
    const initialSnake: Point[] = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ];
    setSnake(initialSnake);
    setDirection("ArrowRight");
    setPendingDirection(null);
    setFood(getRandomEmptyCell(new Set(initialSnake.map((s) => `${s.x},${s.y}`))));
    setRunning(false);
    setGameOver(false);
    setSpeedMs(INITIAL_SPEED_MS);
    setScore(0);
  }, []);

  const step = useCallback(() => {
    setSnake((currentSnake) => {
      const head = currentSnake[0];
      const currentDir = pendingDirection ?? direction;

      let dx = 0;
      let dy = 0;
      if (currentDir === "ArrowUp") dy = -1;
      if (currentDir === "ArrowDown") dy = 1;
      if (currentDir === "ArrowLeft") dx = -1;
      if (currentDir === "ArrowRight") dx = 1;

      const newHead = { x: head.x + dx, y: head.y + dy };

      // wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= BOARD_COLS ||
        newHead.y < 0 ||
        newHead.y >= BOARD_ROWS
      ) {
        setGameOver(true);
        setRunning(false);
        return currentSnake;
      }

      // self collision
      const occupied = new Set(currentSnake.map((s) => `${s.x},${s.y}`));
      if (occupied.has(`${newHead.x},${newHead.y}`)) {
        setGameOver(true);
        setRunning(false);
        return currentSnake;
      }

      let newSnake: Point[];
      // food eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        newSnake = [newHead, ...currentSnake];
        // place new food not on snake
        const occ = new Set(newSnake.map((s) => `${s.x},${s.y}`));
        setFood(getRandomEmptyCell(occ));
        setScore((s) => s + 1);
        setSpeedMs((ms) => Math.max(80, ms - 4));
      } else {
        newSnake = [newHead, ...currentSnake.slice(0, -1)];
      }

      // consume pending dir once applied
      if (pendingDirection) setPendingDirection(null);

      return newSnake;
    });
  }, [direction, food, pendingDirection]);

  // Game loop
  useEffect(() => {
    if (!running || gameOver) return;

    const id = setInterval(() => {
      step();
    }, speedMs);

    return () => clearInterval(id);
  }, [running, gameOver, speedMs, step]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === " " || key === "Spacebar") {
        e.preventDefault();
        setRunning((r) => !r);
        return;
      }
      if (key === "r" || key === "R") {
        e.preventDefault();
        resetGame();
        return;
      }
      if (key !== "ArrowUp" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowRight") {
        return;
      }

      // prevent reversing into itself
      setPendingDirection((prev) => {
        const current = prev ?? direction;
        if (
          (key === "ArrowUp" && current === "ArrowDown") ||
          (key === "ArrowDown" && current === "ArrowUp") ||
          (key === "ArrowLeft" && current === "ArrowRight") ||
          (key === "ArrowRight" && current === "ArrowLeft")
        ) {
          return prev;
        }
        return key as Direction;
      });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction, resetGame]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    draw(ctx, snake, food, gameOver);
  }, [snake, food, gameOver]);

  const width = BOARD_COLS * CELL_SIZE;
  const height = BOARD_ROWS * CELL_SIZE;

  return (
    <section className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Змейка</h1>
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-black/20 backdrop-blur">
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="font-medium">Очки: {score}</div>
          <div className="text-black/60 dark:text-white/60">Скорость: {Math.round(1000 / speedMs)} тиков/с</div>
        </div>
        <div className="flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="px-4 py-2 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 hover:bg-zinc-100 text-sm font-medium"
          >
            {running ? "Пауза" : gameOver ? "Продолжить" : "Старт"}
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="px-4 py-2 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 hover:bg-zinc-100 text-sm font-medium"
          >
            Сбросить
          </button>
          <div className="ml-auto text-sm text-black/60 dark:text-white/60">
            Стрелки — движение, Space — старт/пауза, R — сброс
          </div>
        </div>
      </div>
    </section>
  );
}