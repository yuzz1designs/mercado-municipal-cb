/*
 * Background of "Vender no mercado": market bunting strung across the section,
 * leaves carried by the wind and thin gusts. Outer groups are tagged data-join="…"
 * (never transformed in markup) and animated in animation/join.ts.
 */

const W = 1440

/** Pennants hanging from a sagging string: y = quadratic curve from `ends` to `sag` */
function bunting(ends: number, sag: number, count: number) {
  const at = (t: number) => (1 - t) ** 2 * ends + 2 * (1 - t) * t * sag + t ** 2 * ends
  const step = 1 / count
  return Array.from({ length: count }, (_, i) => {
    const t0 = (i + 0.15) * step
    const t1 = (i + 0.85) * step
    const mid = (t0 + t1) / 2
    return `M${t0 * W} ${at(t0)} L${t1 * W} ${at(t1)} L${mid * W} ${at(mid) + 54} Z`
  })
}

const STRINGS = [
  { ends: 30, sag: 150, count: 16, line: `M0 30 Q${W / 2} 150 ${W} 30` },
  { ends: 110, sag: 250, count: 12, line: `M0 110 Q${W / 2} 250 ${W} 110` },
]

const GUSTS = [
  'M-40 330 C 300 300, 520 360, 820 320 S 1240 280, 1480 310',
  'M-40 560 C 260 540, 600 600, 900 560 S 1300 520, 1480 550',
  'M-40 760 C 340 730, 640 790, 980 750 S 1320 720, 1480 740',
]

const LEAVES = 11

export function JoinBackdrop() {
  return (
    <svg className="join__backdrop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      {STRINGS.map((string, row) => (
        <g key={string.line} data-join="bunting">
          <path d={string.line} fill="none" stroke="#fcfbf7" strokeOpacity="0.18" strokeWidth="1.5" />
          {bunting(string.ends, string.sag, string.count).map((d, i) => (
            <g key={d} data-join="pennant">
              <path d={d} fill={(i + row) % 3 === 0 ? '#e8c98a' : '#fcfbf7'} opacity={(i + row) % 3 === 0 ? 0.22 : 0.08} />
            </g>
          ))}
        </g>
      ))}

      {GUSTS.map((d) => (
        <path key={d} data-join="gust" d={d} pathLength="1" fill="none" stroke="#fcfbf7" strokeOpacity="0.16" strokeWidth="1.2" strokeLinecap="round" />
      ))}

      {Array.from({ length: LEAVES }, (_, i) => (
        <g key={i} data-join="leaf">
          <path d="M0 -12 C 9 -6, 9 6, 0 12 C -9 6, -9 -6, 0 -12 Z" fill={i % 3 ? '#4f8a62' : '#a3ad84'} opacity="0.55" />
          <path d="M0 -10 V10" stroke="#154a35" strokeWidth="1" />
        </g>
      ))}
    </svg>
  )
}
