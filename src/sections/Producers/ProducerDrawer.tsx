import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createPanel, revealPanelContent } from '../../animation/panel'
import { useBag } from '../../bag/BagContext'
import { Photo } from '../../components/Photo'
import { QuantityStepper } from '../../components/QuantityStepper/QuantityStepper'
import type { Producer } from '../../content/producers'
import { lockScroll } from '../../lib/scrollLock'

type ProducerDrawerProps = {
  producer: Producer | null
  previous: Producer | null
  next: Producer | null
  categoryLabel: (producer: Producer) => string
  onSelect: (id: string) => void
  onClose: () => void
}

const pad = (value: number) => String(value).padStart(2, '0')

/** Side panel with a producer's details. Stays mounted so it can animate closed. */
export function ProducerDrawer({ producer, previous, next, categoryLabel, onSelect, onClose }: ProducerDrawerProps) {
  const root = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const controls = useRef<ReturnType<typeof createPanel> | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const unlock = useRef<(() => void) | null>(null)
  const bag = useBag()
  // Keep showing the last producer while the drawer animates closed
  const [shown, setShown] = useState<Producer | null>(producer)
  const open = producer !== null

  if (producer && producer !== shown) setShown(producer)

  useLayoutEffect(() => {
    if (!root.current) return
    controls.current = createPanel(root.current)
    return () => {
      controls.current?.kill()
    }
  }, [])

  // Open / close
  useLayoutEffect(() => {
    if (!controls.current || !root.current) return
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement | null
      unlock.current = lockScroll()
      controls.current.open()
      revealPanelContent(root.current, 0.35)
      closeButton.current?.focus({ preventScroll: true })
    } else {
      unlock.current?.()
      unlock.current = null
      controls.current.close()
      returnFocus.current?.focus({ preventScroll: true })
      returnFocus.current = null
    }
  }, [open])

  // Moving between producers while open
  const shownId = shown?.id
  const wasOpen = useRef(false)
  useLayoutEffect(() => {
    if (wasOpen.current && open && root.current) revealPanelContent(root.current)
    wasOpen.current = open
  }, [shownId, open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && previous) onSelect(previous.id)
      if (event.key === 'ArrowRight' && next) onSelect(next.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, previous, next, onClose, onSelect])

  useEffect(() => () => unlock.current?.(), [])

  // From the card straight to the bag
  const openBag = () => {
    onClose()
    bag.open()
  }

  return createPortal(
    <div
      ref={root}
      className="drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      inert={!open}
    >
      <div className="drawer__backdrop" data-panel="backdrop" onClick={onClose} />

      <article className="drawer__panel" data-panel="body">
        <button ref={closeButton} className="drawer__close label" type="button" onClick={onClose}>
          Fechar
        </button>

        {shown && (
          <>
            <figure className="drawer__media">
              <Photo key={shown.id} image={shown.image} data-panel="photo" />
            </figure>

            <div className="drawer__body">
              <p className="drawer__meta label" data-panel="item">
                <span className="drawer__kind">{shown.kind === 'produtor' ? 'Produção própria' : 'Comerciante'}</span>
                {categoryLabel(shown)}
              </p>
              <h3 id="drawer-title" className="drawer__name" data-panel="item">
                {shown.name}
              </h3>
              <p className="drawer__owner" data-panel="item">
                {shown.owner}
              </p>
              <p className="drawer__description" data-panel="item">
                {shown.description}
              </p>

              <dl className="drawer__facts" data-panel="item">
                <div>
                  <dt className="label">Banca</dt>
                  <dd>{pad(shown.stall)}</dd>
                </div>
                <div>
                  <dt className="label">Origem</dt>
                  <dd>{shown.origin}</dd>
                </div>
                <div>
                  <dt className="label">No mercado desde</dt>
                  <dd>{shown.since}</dd>
                </div>
                <div>
                  <dt className="label">Dias</dt>
                  <dd>{shown.days}</dd>
                </div>
              </dl>

              <div className="drawer__products" data-panel="item">
                <div className="drawer__products-head">
                  <h4 className="label">Encomendar</h4>
                  <p className="drawer__hint">Escolha as quantidades — a banca confirma o preço no levantamento.</p>
                </div>
                <ul>
                  {shown.products.map((product) => (
                    <li key={product.name}>
                      <span className="drawer__product">
                        {product.name}
                        <span className="label">{product.unit}</span>
                      </span>
                      <QuantityStepper
                        value={bag.quantity(shown.id, product.name)}
                        unit={product.unit}
                        step={product.step}
                        label={product.name}
                        onChange={(quantity) => bag.setQuantity(shown.id, product.name, quantity)}
                      />
                    </li>
                  ))}
                </ul>
                {bag.countFor(shown.id) > 0 && (
                  <div className="drawer__bag">
                    <span>
                      No saco: <strong>{bag.countFor(shown.id)}</strong>{' '}
                      {bag.countFor(shown.id) === 1 ? 'produto' : 'produtos'} desta banca
                    </span>
                    <button type="button" onClick={openBag}>
                      Ver saco →
                    </button>
                  </div>
                )}
              </div>
            </div>

            <nav className="drawer__nav" aria-label="Outros negócios">
              <button type="button" disabled={!previous} onClick={() => previous && onSelect(previous.id)}>
                <span className="label">Anterior</span>
                {previous?.name}
              </button>
              <button type="button" disabled={!next} onClick={() => next && onSelect(next.id)}>
                <span className="label">Seguinte</span>
                {next?.name}
              </button>
            </nav>
          </>
        )}
      </article>
    </div>,
    document.body,
  )
}
