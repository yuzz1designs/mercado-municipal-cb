import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { createCarousel, revealCaption } from '../../animation/carousel'
import { Photo } from '../../components/Photo'
import type { Producer } from '../../content/producers'
import './ProducerCarousel.css'

type ProducerCarouselProps = {
  items: Producer[]
  label: string
  categoryLabel: (producer: Producer) => string
  onOpen: (id: string) => void
}

/** Seconds between automatic changes. */
const AUTOPLAY = 6

/** Trackpad swipe: horizontal distance needed to change, and pause before the next change (ms). */
const SWIPE = { threshold: 60, cooldown: 900 }

const pad = (value: number) => String(value).padStart(2, '0')

/** Featured producers in a 3D ring: the centre card opens the producer, side cards come to the centre. */
export function ProducerCarousel({ items, label, categoryLabel, onOpen }: ProducerCarouselProps) {
  const root = useRef<HTMLDivElement>(null)
  const caption = useRef<HTMLDivElement>(null)
  const controls = useRef<ReturnType<typeof createCarousel> | null>(null)
  const drag = useRef<{ x: number; moved: boolean } | null>(null)
  const paused = useRef(false)
  /** Time of the last manual change: autoplay waits a full cycle after it */
  const lastManual = useRef(0)
  const [active, setActive] = useState(0)
  const current = items[active]

  const go = (index: number) => {
    lastManual.current = performance.now()
    setActive((index + items.length) % items.length)
  }

  useLayoutEffect(() => {
    if (!root.current) return
    controls.current = createCarousel(root.current)
    return () => controls.current?.destroy()
  }, [])

  useLayoutEffect(() => {
    controls.current?.goTo(active)
    revealCaption(caption.current)
  }, [active])

  // Autoplay: pauses on hover / focus and while off screen
  useEffect(() => {
    const element = root.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let onScreen = false
    const observer = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting))
    observer.observe(element)
    const timer = window.setInterval(() => {
      const recentlyMoved = performance.now() - lastManual.current < AUTOPLAY * 1000
      if (onScreen && !paused.current && !recentlyMoved && !document.hidden) {
        setActive((index) => (index + 1) % items.length)
      }
    }, AUTOPLAY * 1000)
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [items.length])

  // Trackpad: a horizontal two-finger swipe moves one producer; vertical scrolling is left alone
  useEffect(() => {
    const element = root.current
    if (!element) return
    let travel = 0
    let lockedUntil = 0
    let reset = 0
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      window.clearTimeout(reset)
      reset = window.setTimeout(() => (travel = 0), 200)
      if (performance.now() < lockedUntil) return
      travel += event.deltaX
      if (Math.abs(travel) > SWIPE.threshold) {
        // Read the direction now: the state updater may run after travel is reset
        const step = travel > 0 ? 1 : -1
        lastManual.current = performance.now()
        setActive((index) => (index + step + items.length) % items.length)
        travel = 0
        lockedUntil = performance.now() + SWIPE.cooldown
      }
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      element.removeEventListener('wheel', onWheel)
      window.clearTimeout(reset)
    }
  }, [items.length])

  // Drag / swipe to change
  const onPointerDown = (event: PointerEvent) => (drag.current = { x: event.clientX, moved: false })
  const onPointerUp = (event: PointerEvent) => {
    if (!drag.current) return
    const distance = event.clientX - drag.current.x
    if (Math.abs(distance) > 50) {
      drag.current.moved = true
      go(active + (distance < 0 ? 1 : -1))
    }
  }
  const onCardClick = (index: number) => {
    if (drag.current?.moved) return
    if (index === active) onOpen(items[index].id)
    else go(index)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(active + 1)
    if (event.key === 'ArrowLeft') go(active - 1)
  }

  return (
    <div
      ref={root}
      className="carousel"
      data-producers="band"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      <canvas className="carousel__pollen" data-carousel="pollen" aria-hidden="true" />

      <div className="carousel__stage" data-carousel="stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        {items.map((producer, index) => (
          <button
            key={producer.id}
            type="button"
            className="carousel__card"
            data-carousel="card"
            aria-label={index === active ? `Ver ${producer.name}` : `Mostrar ${producer.name}`}
            aria-current={index === active}
            tabIndex={index === active ? 0 : -1}
            onClick={() => onCardClick(index)}
          >
            <Photo image={producer.image} draggable={false} />
            <span className="carousel__card-top label">
              <span>{pad(index + 1)}</span>
              <span className="carousel__rule" aria-hidden="true" />
              <span className="carousel__chip">{categoryLabel(producer)}</span>
            </span>
            <span className="carousel__card-name">{producer.name}</span>
            <span className="carousel__card-bottom label">
              <span>Banca {pad(producer.stall)}</span>
              <span className="carousel__card-cta">Ver produtor →</span>
            </span>
          </button>
        ))}
      </div>

      <div ref={caption} className="carousel__caption" aria-live="polite">
        <p className="label carousel__eyebrow">
          <span className="carousel__mask">
            <span data-carousel="caption-line" key={`eyebrow-${active}`}>
              {label} / {pad(active + 1)}
            </span>
          </span>
        </p>
        <h3 className="carousel__name">
          <span className="carousel__mask">
            <span data-carousel="caption-line" key={`name-${active}`}>
              {current.name}
            </span>
          </span>
        </h3>
        <p className="carousel__meta">
          <span className="carousel__mask">
            <span data-carousel="caption-line" key={`meta-${active}`}>
              {current.owner}
              <span className="carousel__divider" aria-hidden="true" />
              <span className="label">
                {current.origin} · desde {current.since}
              </span>
            </span>
          </span>
        </p>
      </div>

      <div className="carousel__controls">
        <button type="button" className="carousel__arrow" aria-label="Anterior" onClick={() => go(active - 1)}>
          ←
        </button>
        <div className="carousel__dots">
          {items.map((producer, index) => (
            <button
              key={producer.id}
              type="button"
              className="carousel__dot"
              aria-label={producer.name}
              aria-current={index === active}
              onClick={() => go(index)}
            />
          ))}
        </div>
        <button type="button" className="carousel__arrow" aria-label="Seguinte" onClick={() => go(active + 1)}>
          →
        </button>
      </div>
    </div>
  )
}
