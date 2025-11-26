"use client";

import { useState, useEffect } from "react";

type Cell = {
  hasShip: boolean;
  hit: boolean;
  destroyed: boolean;
};

type Ship = {
  cells: [number, number][];
  hits: number;
};

const GRID_SIZE = 10;
const SHIP_SIZES = [4, 3, 2];

function generateShips(): Ship[] {
  const ships: Ship[] = [];
  const occupied = new Set<string>();

  const placeShip = (size: number) => {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      const cells: [number, number][] = [];

      for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        if (r >= GRID_SIZE || c >= GRID_SIZE) {
          cells.length = 0;
          break;
        }
        cells.push([r, c]);
      }

      if (cells.length !== size) continue;

      const key = cells.map(([r, c]) => `${r},${c}`).join("|");
      if (occupied.has(key)) continue;

      cells.forEach(([r, c]) => occupied.add(`${r},${c}`));
      ships.push({ cells, hits: 0 });
      placed = true;
    }
  };

  SHIP_SIZES.forEach(placeShip);
  return ships;
}

export default function BattleshipGame() {
  const [grid, setGrid] = useState<Cell[][]>(
    Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({
        hasShip: false,
        hit: false,
        destroyed: false,
      }))
    )
  );
  const [ships, setShips] = useState<Ship[]>([]);
  const [destroyedCount, setDestroyedCount] = useState(0);

  useEffect(() => {
    const newShips = generateShips();
    setShips(newShips);
    const newGrid = grid.map((row, r) =>
      row.map((cell, c) => {
        const hasShip = newShips.some((ship) =>
          ship.cells.some(([sr, sc]) => sr === r && sc === c)
        );
        return { ...cell, hasShip };
      })
    );
    setGrid(newGrid);
  }, []);

  const handleClick = (r: number, c: number) => {
    setGrid((prev) =>
      prev.map((row, rr) =>
        row.map((cell, cc) => {
          if (rr !== r || cc !== c || cell.hit) return cell;
          const newCell = { ...cell, hit: true };
          if (cell.hasShip) {
            const ship = ships.find((s) =>
              s.cells.some(([sr, sc]) => sr === r && sc === c)
            );
            if (ship) {
              ship.hits += 1;
              if (ship.hits === ship.cells.length) {
                setDestroyedCount((d) => d + 1);
                ship.cells.forEach(([sr, sc]) => {
                  newCell.destroyed = true;
                });
              }
            }
          }
          return newCell;
        })
      )
    );
  };

  const renderCell = (cell: Cell, r: number, c: number) => {
    let bg = "bg-gray-200";
    let content = null;
    if (cell.hit) {
      if (cell.hasShip) {
        bg = cell.destroyed ? "bg-red-500" : "bg-green-500";
        content = <span className="text-white font-bold">X</span>;
      } else {
        bg = "bg-blue-500";
        content = <span className="text-white font-bold">X</span>;
      }
    }
    return (
      <div
        key={`${r}-${c}`}
        className={`w-8 h-8 border border-gray-400 ${bg} flex items-center justify-center cursor-pointer`}
        onClick={() => handleClick(r, c)}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {destroyedCount === SHIP_SIZES.length && (
        <h1 className="text-4xl font-bold mb-4">YOU WIN</h1>
      )}
      <div className="grid grid-cols-10 gap-1">
        {grid.map((row, r) =>
          row.map((cell, c) => renderCell(cell, r, c))
        )}
      </div>
    </div>
  );
}
