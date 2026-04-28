// Lightweight inline SVG QR-style renderer used for promo and My Cup redemption mocks.
"use client";

function hashCode(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function buildFinderCells(originX: number, originY: number) {
  const cells: string[] = [];
  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const isBorder = x === 0 || x === 6 || y === 0 || y === 6;
      const isCore = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      if (isBorder || isCore) {
        cells.push(`${originX + x},${originY + y}`);
      }
    }
  }
  return new Set(cells);
}

export function MockQRCode({
  code,
  className = ""
}: {
  code: string;
  className?: string;
}) {
  const size = 29;
  const finderCells = new Set([
    ...buildFinderCells(0, 0),
    ...buildFinderCells(size - 7, 0),
    ...buildFinderCells(0, size - 7)
  ]);
  const seed = hashCode(code);
  const cells: string[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const key = `${x},${y}`;
      if (finderCells.has(key)) {
        cells.push(key);
        continue;
      }

      const value = (seed + x * 13 + y * 17 + ((x * y) % 11)) % 7;
      if (value < 3) cells.push(key);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`QR code for ${code}`}
      className={`rounded-[1.5rem] bg-white p-3 ${className}`.trim()}
    >
      <rect width={size} height={size} rx={2} fill="white" />
      {cells.map((cell) => {
        const [x, y] = cell.split(",").map(Number);
        return <rect key={cell} x={x} y={y} width="1" height="1" fill="#0a1628" rx="0.08" />;
      })}
    </svg>
  );
}
