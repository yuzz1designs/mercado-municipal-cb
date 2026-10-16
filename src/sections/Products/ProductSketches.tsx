import { useId } from 'react'
import { sketches } from './sketches'

/** Hand-drawn style product sketches on a stone disc, cycled by animation/products.ts. */
export function ProductSketches() {
  // A slight displacement gives the lines a pencil wobble
  const filter = `sketch-${useId().replace(/:/g, '')}`

  return (
    <div className="products__sketches" aria-hidden="true">
      <svg className="products__sketch-defs" width="0" height="0">
        <filter id={filter}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
      </svg>

      <div className="products__sketch-stage">
        <span className="products__sketch-disc" data-products="sketch-disc" />
        {sketches.map((sketch) => (
          <div className="products__sketch" data-products="sketch" key={sketch.name}>
            <svg viewBox="0 0 200 200" filter={`url(#${filter})`}>
              {sketch.paths.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
          </div>
        ))}
      </div>

      <ol className="products__sketch-names">
        {sketches.map((sketch) => (
          <li key={sketch.name} data-products="sketch-name">
            {sketch.name}
          </li>
        ))}
      </ol>
    </div>
  )
}
