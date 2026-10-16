import { useLayoutEffect, useRef } from 'react'
import { createEntrance } from '../animation/entrance'
import { Hero } from './Hero/Hero'
import { Welcome } from './Welcome/Welcome'
import './Entrance.css'

/** Welcome and Hero share one sticky stage so the transition reads as a single shot. */
export function Entrance() {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!root.current) return
    return createEntrance(root.current)
  }, [])

  return (
    <div ref={root} id="inicio" className="entrance">
      <div className="entrance__stage" data-entrance="stage">
        <Hero />
        <Welcome />
      </div>
    </div>
  )
}
