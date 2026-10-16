import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { createPanel, revealPanelContent } from '../../animation/panel'
import { useBag } from '../../bag/BagContext'
import { buildOrderMessages, isValidPhone, sendOrder, type Customer } from '../../bag/order'
import { lockScroll } from '../../lib/scrollLock'
import { Photo } from '../Photo'
import { QuantityStepper } from '../QuantityStepper/QuantityStepper'
import { OrderComplete } from './OrderComplete'
import './Bag.css'

const pad = (value: number) => String(value).padStart(2, '0')

/** PLACEHOLDER market days and pickup slots, until the real opening hours are defined. */
const MARKET_DAYS = [2, 3, 4, 5, 6] // Tuesday to Saturday
const SLOTS = ['8h – 10h', '10h – 12h', '12h – 13h']

/** The next market days, starting tomorrow. */
function pickupDays(count = 4) {
  const format = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
  const days: string[] = []
  const date = new Date()
  while (days.length < count) {
    date.setDate(date.getDate() + 1)
    if (MARKET_DAYS.includes(date.getDay())) days.push(format.format(date))
  }
  return days
}

type Confirmation = { stalls: number; pickup: string }

/** Shopping bag: products grouped by stall, customer details, and the order (simulated for now). */
export function BagPanel() {
  const bag = useBag()
  const root = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const controls = useRef<ReturnType<typeof createPanel> | null>(null)
  const unlock = useRef<(() => void) | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const days = useMemo(() => pickupDays(), [])
  const [customer, setCustomer] = useState({ name: '', phone: '', day: days[0], slot: SLOTS[0] })
  const [showErrors, setShowErrors] = useState(false)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)

  const errors = {
    name: customer.name.trim() ? '' : 'Indique o seu nome.',
    phone: isValidPhone(customer.phone) ? '' : 'Indique um telemóvel válido (9 dígitos).',
  }

  useLayoutEffect(() => {
    if (!root.current) return
    controls.current = createPanel(root.current)
    return () => {
      controls.current?.kill()
    }
  }, [])

  useLayoutEffect(() => {
    if (!controls.current || !root.current) return
    if (bag.isOpen) {
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
  }, [bag.isOpen])

  useEffect(() => {
    if (!bag.isOpen) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && bag.close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bag])

  useEffect(() => () => unlock.current?.(), [])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (errors.name || errors.phone) {
      setShowErrors(true)
      return
    }
    const order: Customer = {
      name: customer.name.trim(),
      phone: customer.phone.replace(/\s/g, ''),
      pickup: `${customer.day}, ${customer.slot}`,
    }
    // One SMS per stall (simulated until the backend exists)
    void sendOrder(buildOrderMessages(bag.groups, order))
    setConfirmation({ stalls: bag.groups.length, pickup: order.pickup })
    setShowErrors(false)
    bag.clear()
    bag.close()
  }

  return createPortal(
    <div ref={root} className="drawer bag" role="dialog" aria-modal="true" aria-labelledby="bag-title" inert={!bag.isOpen}>
      <div className="drawer__backdrop" data-panel="backdrop" onClick={bag.close} />

      <aside className="drawer__panel bag__panel" data-panel="body">
        <header className="bag__head">
          <h2 id="bag-title" className="bag__title">
            O seu saco
          </h2>
          <button ref={closeButton} className="drawer__close label" type="button" onClick={bag.close}>
            Fechar
          </button>
        </header>

        {bag.groups.length === 0 ? (
          <div className="bag__empty" data-panel="item">
            <p>O saco está vazio.</p>
            <p className="bag__lead">
              Abra a ficha de uma banca em <em>Quem faz o mercado</em> e escolha o que quer encomendar. Cada banca
              recebe o seu pedido por SMS.
            </p>
            <a className="bag__primary" href="#produtores" onClick={bag.close}>
              Ver as bancas
            </a>
          </div>
        ) : (
          <form className="bag__form" onSubmit={submit} noValidate>
            <ul className="bag__groups">
              {bag.groups.map(({ producer, lines, note }) => (
                <li key={producer.id} className="bag__group" data-panel="item">
                  <div className="bag__group-head">
                    <span className="bag__thumb">
                      <Photo image={producer.image} />
                    </span>
                    <span className="bag__group-name">
                      <span className="label">Banca {pad(producer.stall)}</span>
                      {producer.name}
                    </span>
                    <button
                      type="button"
                      className="bag__remove label"
                      onClick={() => bag.removeProducer(producer.id)}
                      aria-label={`Remover ${producer.name} do saco`}
                    >
                      Remover
                    </button>
                  </div>
                  <ul className="bag__lines">
                    {lines.map(({ product, quantity }) => (
                      <li key={product.name}>
                        <span>{product.name}</span>
                        <QuantityStepper
                          value={quantity}
                          unit={product.unit}
                          step={product.step}
                          label={product.name}
                          onChange={(value) => bag.setQuantity(producer.id, product.name, value)}
                        />
                      </li>
                    ))}
                  </ul>
                  <label className="bag__note">
                    <span className="label">Nota para a banca (opcional)</span>
                    <input
                      type="text"
                      value={note}
                      maxLength={140}
                      placeholder="Ex.: bem maduro, para levar hoje"
                      onChange={(event) => bag.setNote(producer.id, event.target.value)}
                    />
                  </label>
                </li>
              ))}
            </ul>

            <fieldset className="bag__customer" data-panel="item">
              <legend className="label bag__section-title">Os seus dados</legend>
              <label>
                <span className="label">Nome</span>
                <input
                  type="text"
                  autoComplete="name"
                  value={customer.name}
                  aria-invalid={showErrors && !!errors.name}
                  onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                />
                {showErrors && errors.name && <span className="bag__error">{errors.name}</span>}
              </label>
              <label>
                <span className="label">Telemóvel</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="912 345 678"
                  value={customer.phone}
                  aria-invalid={showErrors && !!errors.phone}
                  onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                />
                {showErrors && errors.phone && <span className="bag__error">{errors.phone}</span>}
              </label>
              <div className="bag__pickup">
                <label>
                  <span className="label">Levantamento</span>
                  <select value={customer.day} onChange={(event) => setCustomer({ ...customer, day: event.target.value })}>
                    {days.map((day) => (
                      <option key={day}>{day}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">Hora</span>
                  <select value={customer.slot} onChange={(event) => setCustomer({ ...customer, slot: event.target.value })}>
                    {SLOTS.map((slot) => (
                      <option key={slot}>{slot}</option>
                    ))}
                  </select>
                </label>
              </div>
            </fieldset>

            <div className="bag__submit" data-panel="item">
              <p>
                {bag.groups.length} {bag.groups.length === 1 ? 'banca' : 'bancas'} · {bag.count}{' '}
                {bag.count === 1 ? 'produto' : 'produtos'}. O pagamento é feito em cada banca, no levantamento.
              </p>
              <button type="submit" className="bag__primary">
                Enviar pedido
              </button>
            </div>
          </form>
        )}
      </aside>

      {confirmation && (
        <OrderComplete
          stalls={confirmation.stalls}
          pickup={confirmation.pickup}
          onClose={() => setConfirmation(null)}
        />
      )}
    </div>,
    document.body,
  )
}
