/*
 * Illustrated view of Castelo Branco, in the same flat style as the market panorama:
 * far hills, the castle hill (walls, keep, Santa Maria do Castelo church),
 * whitewashed houses down the slope, and green hills with olive trees in front.
 * Layers are tagged data-complete="layer-…" so they can rise at different depths.
 */

const VIEW = { width: 1600, height: 800 }

// Deterministic pseudo-random, so the drawing is the same on every render
let seed = 7
const random = (min: number, max: number) => {
  seed = (seed * 16807) % 2147483647
  return min + (seed / 2147483647) * (max - min)
}

type House = { x: number; y: number; width: number; height: number; roof: string; wall: string; windows: number }
type Tree = { x: number; y: number; scale: number }

/** Whitewashed houses in terraces down the castle hill. */
const houses: House[] = []
/** Each terrace spans only where the hill is high enough to stand on */
const terraces = [
  { y: 470, from: 700, to: 1230 },
  { y: 540, from: 570, to: 1340 },
  { y: 610, from: 330, to: 1460 },
  { y: 680, from: 40, to: 1570 },
]
for (const terrace of terraces) {
  for (let x = terrace.from; x < terrace.to; x += random(34, 52)) {
    // Leave room for the castle on the upper terrace
    if (terrace.y === 470 && x > 820 && x < 1110) continue
    houses.push({
      x,
      y: terrace.y + random(-8, 8),
      width: random(28, 44),
      height: random(22, 34),
      roof: random(0, 1) > 0.25 ? '#b5653a' : '#a3402a',
      wall: random(0, 1) > 0.2 ? '#fcfbf7' : '#efe3c8',
      windows: Math.floor(random(1, 3)),
    })
  }
}

/** Cypresses between the houses */
const cypresses: Tree[] = Array.from({ length: 14 }, () => {
  const terrace = terraces[1 + Math.floor(random(0, 3))]
  return { x: random(terrace.from, terrace.to), y: terrace.y, scale: random(0.8, 1.3) }
})

/** Olive trees on the green hills in front */
const olives: Tree[] = Array.from({ length: 11 }, (_, index) => ({
  x: 60 + index * 150 + random(-40, 40),
  y: random(745, 775),
  scale: random(0.8, 1.25),
}))

const merlons = (x: number, y: number, width: number, size = 12) =>
  Array.from({ length: Math.floor(width / (size * 1.8)) }, (_, i) => (
    <rect key={i} x={x + i * size * 1.8} y={y - size} width={size} height={size} />
  ))

export function CityScape() {
  return (
    <svg
      className="cityscape"
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      {/* Sun */}
      <circle data-complete="layer-sun" cx="1080" cy="330" r="130" fill="#ead9b2" opacity="0.7" />

      {/* Far hills */}
      <path
        data-complete="layer-far"
        d="M0 560 C200 500 400 525 600 495 S1000 470 1200 500 S1500 525 1600 505 L1600 800 L0 800 Z"
        fill="#ddd3c0"
      />

      {/* Castle hill */}
      <g data-complete="layer-castle">
        <path
          d="M0 650 C300 610 520 560 700 470 C800 420 880 392 960 388 C1060 384 1150 420 1260 480 C1380 545 1500 595 1600 610 L1600 800 L0 800 Z"
          fill="#c9b48e"
        />
        {/* Walls with battlements */}
        <g fill="#b9a585">
          <rect x="820" y="340" width="300" height="56" />
          {merlons(820, 340, 300)}
        </g>
        {/* Keep */}
        <g fill="#a8946f">
          <rect x="1010" y="250" width="74" height="146" />
          {merlons(1010, 250, 74)}
          <rect x="1040" y="290" width="10" height="22" fill="#6f5e45" />
        </g>
        {/* Corner tower */}
        <g fill="#a8946f">
          <rect x="830" y="292" width="54" height="104" />
          {merlons(830, 292, 54)}
        </g>
        {/* Santa Maria do Castelo: nave and bell tower */}
        <g>
          <rect x="905" y="352" width="96" height="44" fill="#fcfbf7" />
          <path d="M898 352 L953 322 L1008 352 Z" fill="#b5653a" />
          <rect x="912" y="296" width="28" height="58" fill="#fcfbf7" />
          <path d="M908 296 L926 272 L944 296 Z" fill="#a3402a" />
          <rect x="921" y="306" width="10" height="14" fill="#6f5e45" />
        </g>
      </g>

      {/* Houses and cypresses */}
      <g data-complete="layer-town">
        {cypresses.map((tree, i) => (
          <ellipse
            key={`c${i}`}
            cx={tree.x}
            cy={tree.y - 34 * tree.scale}
            rx={9 * tree.scale}
            ry={38 * tree.scale}
            fill="#2f5a2e"
          />
        ))}
        {houses.map((house, i) => (
          <g key={i}>
            <rect x={house.x} y={house.y - house.height} width={house.width} height={house.height} fill={house.wall} />
            <path
              d={`M${house.x - 3} ${house.y - house.height} L${house.x + house.width * 0.5} ${house.y - house.height - 12} L${house.x + house.width + 3} ${house.y - house.height} Z`}
              fill={house.roof}
            />
            {Array.from({ length: house.windows }, (_, w) => (
              <rect
                key={w}
                x={house.x + 6 + w * 13}
                y={house.y - house.height + 8}
                width="6"
                height="8"
                fill="#6f5e45"
                opacity="0.7"
              />
            ))}
          </g>
        ))}
      </g>

      {/* Green hills and olive trees in front */}
      <g data-complete="layer-front">
        <path
          d="M0 730 C300 700 600 750 900 722 S1400 700 1600 728 L1600 800 L0 800 Z"
          fill="#154a35"
        />
        {olives.map((tree, i) => (
          <g key={i} transform={`translate(${tree.x} ${tree.y}) scale(${tree.scale})`}>
            <rect x="-3" y="-26" width="6" height="26" fill="#3a2a1d" />
            <circle cx="-14" cy="-34" r="16" fill="#6f805a" />
            <circle cx="10" cy="-38" r="18" fill="#8a9a6a" />
            <circle cx="-2" cy="-50" r="15" fill="#6f805a" />
          </g>
        ))}
      </g>
    </svg>
  )
}
