/*
 * An empty market stall waiting for its producer, in the flat illustration style
 * of the other drawings. Outer groups are tagged data-join="…" (never transformed
 * in markup) so the stall can build itself and the tag can swing (animation/join.ts).
 */

const STRIPES = 8

export function JoinStall() {
  return (
    <svg className="stall-art" viewBox="0 0 800 700" role="img" aria-label="Ilustração de uma banca de mercado vazia, com a etiqueta Livre">
      {/* A soft disc grounding the stall on the green */}
      <circle cx="400" cy="400" r="300" fill="#1f5a42" />
      <ellipse cx="400" cy="628" rx="300" ry="22" fill="#0f3426" opacity="0.6" />

      {/* Posts */}
      <g data-join="posts">
        <rect x="168" y="214" width="20" height="410" rx="3" fill="#a37b52" />
        <rect x="612" y="214" width="20" height="410" rx="3" fill="#a37b52" />
      </g>

      {/* Counter */}
      <g data-join="counter">
        <rect x="140" y="470" width="520" height="152" fill="#c9a06e" />
        {[506, 542, 578].map((y) => (
          <rect key={y} x="140" y={y} width="520" height="3" fill="#a37b52" opacity="0.7" />
        ))}
        <rect x="126" y="456" width="548" height="20" rx="4" fill="#e1c294" />
        {/* Price board on the front */}
        <rect x="330" y="508" width="140" height="80" rx="4" fill="#26302b" />
        <text className="stall-art__board" x="400" y="556" textAnchor="middle">
          a sua banca
        </text>
      </g>

      {/* Empty crates, waiting for produce */}
      <g data-join="crates">
        {[
          [190, 404],
          [300, 418],
          [520, 410],
        ].map(([x, y]) => (
          <g key={x}>
            <rect x={x} y={y} width="90" height="52" fill="#b98b5c" />
            <rect x={x} y={y + 14} width="90" height="5" fill="#8a6640" />
            <rect x={x} y={y + 32} width="90" height="5" fill="#8a6640" />
          </g>
        ))}
      </g>

      {/* Striped awning with a scalloped edge */}
      <g data-join="awning">
        <rect x="140" y="200" width="520" height="24" rx="4" fill="#f3efe6" />
        {Array.from({ length: STRIPES }, (_, i) => {
          const width = 520 / STRIPES
          const x = 140 + i * width
          return (
            <path
              key={i}
              d={`M${x} 224 H${x + width} V300 Q${x + width / 2} 330 ${x} 300 Z`}
              fill={i % 2 ? '#f3efe6' : '#8fb3a0'}
            />
          )
        })}
      </g>

      {/* "Livre" tag hanging from the awning */}
      <g data-join="tag">
        <path d="M400 300 V334" stroke="#f3efe6" strokeWidth="2" />
        <rect x="342" y="334" width="116" height="56" rx="8" fill="#f3efe6" />
        <circle cx="400" cy="345" r="4" fill="#1f5a42" />
        <text className="stall-art__tag" x="400" y="378" textAnchor="middle">
          Livre
        </text>
      </g>
    </svg>
  )
}
