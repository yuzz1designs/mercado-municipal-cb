import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { playComplete } from '../../animation/complete'
import { lockScroll } from '../../lib/scrollLock'
import { CityScape } from './CityScape'

type OrderCompleteProps = {
  /** Number of stalls that will receive the order */
  stalls: number
  pickup: string
  onClose: () => void
}

/** Wind streaks across the sky: [y in %, length in px] */
const WIND = [
  [14, 900],
  [24, 1200],
  [33, 700],
  [42, 1000],
]

/** Full-screen thank-you over an illustrated Castelo Branco, shown once an order is sent. */
export function OrderComplete({ stalls, pickup, onClose }: OrderCompleteProps) {
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const animation = useRef<ReturnType<typeof playComplete> | null>(null)
  const leaving = useRef(false)

  useLayoutEffect(() => {
    if (!root.current) return
    const unlock = lockScroll()
    animation.current = playComplete(root.current)
    // After the bag panel has handed focus back to the page
    const focus = window.setTimeout(() => button.current?.focus({ preventScroll: true }), 50)
    return () => {
      window.clearTimeout(focus)
      unlock()
      animation.current?.kill()
    }
  }, [])

  const close = () => {
    if (leaving.current) return
    leaving.current = true
    if (animation.current) animation.current.leave(onClose)
    else onClose()
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return createPortal(
    <div ref={root} className="complete" role="dialog" aria-modal="true" aria-labelledby="complete-title">
      <CityScape />

      {/* Wind and birds over the sky */}
      <svg className="complete__wind" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true">
        {WIND.map(([y, length]) => (
          <path
            key={y}
            data-complete="wind"
            data-length={length}
            d={`M-100 ${y * 10} C 300 ${y * 10 - 18}, 800 ${y * 10 + 14}, 1700 ${y * 10 - 6}`}
            strokeDasharray={`${length * 0.18} ${length}`}
          />
        ))}
      </svg>
      <div className="complete__birds" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <svg key={index} className="complete__bird" data-complete="bird" viewBox="0 0 40 20">
            <path data-complete="wings" d="M2 10 Q11 2 20 10 Q29 2 38 10" />
          </svg>
        ))}
      </div>

      <div className="complete__content">
        <h2 id="complete-title" className="complete__title">
          <span className="line">
            <span data-complete="line">Pedido enviado.</span>
          </span>
          <span className="line">
            <span data-complete="line">
              Obrigado por escolher <em>Castelo Branco.</em>
            </span>
          </span>
        </h2>
        <p className="complete__note" data-complete="fade">
          {stalls === 1 ? 'A banca vai receber' : `As ${stalls} bancas vão receber`} o seu pedido por SMS. Levantamento:{' '}
          {pickup}.
        </p>
        <button ref={button} type="button" className="complete__button" data-complete="fade" onClick={close}>
          Continuar a explorar
        </button>
      </div>
    </div>,
    document.body,
  )
}
