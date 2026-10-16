/*
 * The Mercado Municipal in the flat illustration style of the market panorama and
 * the city view, drawn from a street photo as a simplified front elevation:
 * the concrete block with its "Mercado Municipal" sign and canopy, the vault behind,
 * the long wing (window band, brick frieze, piers, portico), lamp post, trees and street.
 * Layers are tagged data-visit="…" (outer groups, never transformed in markup)
 * so they can rise in turn (animation/visit.ts).
 * The sign is centred at (560, 465) in the 1200 × 900 viewBox.
 * Clouds, sun, birds, banner and trees are tagged for the ambient animation.
 */

const GROUND = 720
const WING = { left: 700, top: 470, windows: [490, 560], brick: [560, 610] }
const PIERS = Array.from({ length: 8 }, (_, i) => WING.left + 20 + i * 70)

function Tree({ x, size = 1 }: { x: number; size?: number }) {
  return (
    <g data-visit="tree" transform={`translate(${x} ${GROUND}) scale(${size})`}>
      <rect x="-5" y="-130" width="10" height="130" fill="#6f5e45" />
      <circle cx="-30" cy="-150" r="38" fill="#8a9a6a" />
      <circle cx="26" cy="-160" r="42" fill="#a3ad84" />
      <circle cx="-4" cy="-195" r="36" fill="#8a9a6a" />
    </g>
  )
}

function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g data-visit="cloud" transform={`translate(${x} ${y}) scale(${scale})`} fill="#f8f4ea">
      <ellipse cx="0" cy="0" rx="70" ry="24" />
      <circle cx="-26" cy="-14" r="26" />
      <circle cx="16" cy="-22" r="32" />
    </g>
  )
}

export function VisitScene() {
  return (
    <svg
      className="scene"
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Ilustração do Mercado Municipal de Castelo Branco, visto da rua"
    >
      <rect width="1200" height="900" fill="#efe8da" />

      {/* Sky and the town behind */}
      <g data-visit="far">
        <circle data-visit="sun" cx="1010" cy="190" r="110" fill="#ead9b2" opacity="0.8" />
        <Cloud x={200} y={170} />
        <Cloud x={620} y={120} scale={0.8} />
        <Cloud x={930} y={300} scale={0.7} />
        {/* Birds crossing the sky (animated) */}
        {[
          [0, 150, 1],
          [40, 175, 0.75],
          [-30, 200, 0.6],
        ].map(([x, y, size]) => (
          <g key={`${x}${y}`} data-visit="bird" transform={`translate(${x} ${y}) scale(${size})`}>
            <path data-visit="wings" d="M-20 0 Q-10 -10 0 0 Q10 -10 20 0" fill="none" stroke="#1f2a24" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ))}
        <g fill="#e2d8c4">
          <rect x="40" y="440" width="120" height="280" />
          <rect x="980" y="380" width="160" height="200" />
          <rect x="1120" y="420" width="80" height="160" />
          <path d="M30 440 L100 400 L170 440 Z" fill="#d9a78c" />
        </g>
      </g>

      {/* The vault rising behind the block */}
      <g data-visit="vault">
        <path d="M290 340 C 330 250, 660 240, 710 330 Z" fill="#c9bfae" />
        <path d="M318 300 C 390 262, 610 256, 682 296 L688 312 C 610 278, 390 282, 312 316 Z" fill="#5f6f66" />
        {[350, 390, 430, 470, 510, 550, 590, 630].map((x) => (
          <rect key={x} x={x} y="276" width="4" height="40" fill="#c9bfae" opacity="0.8" />
        ))}
        {/* Weathering streaks */}
        {[330, 375, 455, 540, 620, 675].map((x) => (
          <rect key={x} x={x} y="312" width="8" height="26" fill="#b7ab97" opacity="0.7" />
        ))}
      </g>

      {/* The concrete block, its slatted window, sign and canopy */}
      <g data-visit="building">
        <rect x="180" y="330" width="530" height={GROUND - 330} fill="#e9e3d6" />
        <rect x="180" y="330" width="530" height="12" fill="#d9d1c1" />
        {/* Weathering on the concrete */}
        {[210, 300, 380, 640, 690].map((x) => (
          <rect key={x} x={x} y="342" width="10" height={x > 600 ? 120 : 70} fill="#dcd5c5" />
        ))}
        {/* Vertical slatted window */}
        <rect x="246" y="400" width="74" height="130" fill="#3d4a3f" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={250 + i * 9} y="400" width="3" height="130" fill="#6f8580" />
        ))}
        {/* Glass entrance under the canopy */}
        <rect x="330" y="605" width="240" height={GROUND - 605} fill="#9fb3ad" />
        {[370, 410, 450, 490, 530].map((x) => (
          <rect key={x} x={x} y="605" width="4" height={GROUND - 605} fill="#e9e3d6" />
        ))}
        <rect x="430" y="640" width="60" height={GROUND - 640} fill="#2c3a32" />
        {/* Canopy reaching out to the left, with its shadow */}
        <rect x="0" y="584" width="610" height="20" fill="#d9d1c1" />
        <rect x="0" y="604" width="610" height="10" fill="#c9bfae" />
        <rect x="58" y="614" width="8" height={GROUND - 614} fill="#c9bfae" />
      </g>

      {/* The long wing */}
      <g data-visit="wing">
        <rect x={WING.left} y={WING.top} width={1200 - WING.left} height={GROUND - WING.top} fill="#e9e3d6" />
        <rect x={WING.left} y={WING.top} width={1200 - WING.left} height="10" fill="#d9d1c1" />
        {/* Window band */}
        <rect x={WING.left} y={WING.windows[0]} width={1200 - WING.left} height={WING.windows[1] - WING.windows[0]} fill="#3d4a3f" />
        {PIERS.map((x) => (
          <rect key={x} x={x + 22} y={WING.windows[0] + 6} width="14" height={WING.windows[1] - WING.windows[0] - 12} fill="#6f8580" opacity="0.6" />
        ))}
        {/* Brick frieze */}
        <rect x={WING.left} y={WING.brick[0]} width={1200 - WING.left} height={WING.brick[1] - WING.brick[0]} fill="#b5553f" />
        {[575, 590].map((y) => (
          <rect key={y} x={WING.left} y={y} width={1200 - WING.left} height="2" fill="#a3482f" />
        ))}
        {/* Portico and shops */}
        <rect x={WING.left} y={WING.brick[1]} width={1200 - WING.left} height={GROUND - WING.brick[1]} fill="#2c3a32" />
        {[760, 772, 784, 796, 808].map((x) => (
          <rect key={x} x={x} y={WING.brick[1] + 6} width="6" height={GROUND - WING.brick[1] - 6} fill="#f2eee5" />
        ))}
        {PIERS.slice(3).map((x) => (
          <path key={x} d={`M${x + 4} 628 H${x + 66} L${x + 60} 646 H${x + 10} Z`} fill="#154a35" />
        ))}
        {/* Piers, full height */}
        {PIERS.map((x) => (
          <rect key={x} x={x} y={WING.top} width="10" height={GROUND - WING.top} fill="#e9e3d6" />
        ))}
        {/* Corner gate */}
        <rect x={WING.left - 4} y={WING.brick[1]} width="32" height={GROUND - WING.brick[1]} fill="#26302b" />
        {[0, 8, 16, 24].map((dx) => (
          <rect key={dx} x={WING.left + dx - 2} y={WING.brick[1]} width="2" height={GROUND - WING.brick[1]} fill="#4a5a52" />
        ))}
      </g>

      {/* Sign panel, standing proud of the façade */}
      <g data-visit="sign">
        <rect x="448" y="378" width="240" height="190" fill="#d6cebd" />
        <rect x="440" y="370" width="240" height="190" fill="#f4f0e8" />
        <text className="scene__sign-top" x="560" y="440" textAnchor="middle">
          MERCADO
        </text>
        <text className="scene__sign-main" x="560" y="498" textAnchor="middle">
          Municipal
        </text>
      </g>

      {/* Trees, cypress and the lamp post */}
      <g data-visit="trees">
        <ellipse cx="96" cy="520" rx="24" ry="200" fill="#2f5a2e" />
        <Tree x={880} />
        <Tree x={1030} size={0.9} />
        <Tree x={1160} size={0.85} />
      </g>
      <g data-visit="lamp">
        <rect x="756" y="250" width="8" height={GROUND - 250} fill="#4a4f48" />
        <path d="M760 254 C 770 226, 810 216, 860 214 L858 222 C 812 224, 778 234, 766 258 Z" fill="#4a4f48" />
        <path d="M842 210 H896 L888 226 H850 Z" fill="#4a4f48" />
        <path data-visit="banner" d="M730 350 H756 V470 L743 456 L730 470 Z" fill="#154a35" />
      </g>

      {/* Pavement and cobbled street */}
      <g data-visit="front">
        <rect y={GROUND} width="1200" height="40" fill="#e2d9c6" />
        <rect y={GROUND + 40} width="1200" height="10" fill="#d6cbb4" />
        <rect y={GROUND + 50} width="1200" height={900 - GROUND - 50} fill="#cfc4ae" />
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 24 }, (_, col) => (
            <rect
              key={`${row}-${col}`}
              x={col * 52 + (row % 2) * 26 + 6}
              y={GROUND + 64 + row * 24}
              width="38"
              height="14"
              rx="5"
              fill="#d9cfbb"
            />
          )),
        )}
      </g>
    </svg>
  )
}
