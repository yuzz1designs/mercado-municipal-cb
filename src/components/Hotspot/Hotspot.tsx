import type { Spot } from '../../content/home'
import './Hotspot.css'

type HotspotProps = {
  spot: Spot
  index: number
}

/**
 * A point pinned to an image with its story card.
 * The card's visibility comes from --reveal (0 → 1), driven by animation/walk.ts.
 */
export function Hotspot({ spot, index }: HotspotProps) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <article className="hotspot" data-entrance="spot" data-side={spot.side} style={{ left: spot.x, top: spot.y }}>
      <div className="hotspot__marker" aria-hidden="true">
        <span className="hotspot__dot" />
        <span className="hotspot__label label">
          {number} — {spot.label}
        </span>
      </div>

      <div className="hotspot__card">
        <h3 className="hotspot__title">
          {spot.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h3>
        <p className="hotspot__text">{spot.text}</p>
      </div>
    </article>
  )
}
