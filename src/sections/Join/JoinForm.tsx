import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { createPanel, revealPanelContent } from '../../animation/panel'
import { isValidPhone } from '../../bag/order'
import { categories } from '../../content/producers'
import { lockScroll } from '../../lib/scrollLock'
import { isValidEmail, sendApplication, type Application } from './application'

type JoinFormProps = {
  open: boolean
  onClose: () => void
}

const empty: Application = {
  name: '',
  business: '',
  phone: '',
  email: '',
  origin: '',
  category: categories[0].label,
  kind: 'produtor',
  message: '',
}

/** Side panel with the application form for new stallholders (frontend only for now). */
export function JoinForm({ open, onClose }: JoinFormProps) {
  const root = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const controls = useRef<ReturnType<typeof createPanel> | null>(null)
  const unlock = useRef<(() => void) | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const [form, setForm] = useState<Application>(empty)
  const [consent, setConsent] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [sent, setSent] = useState(false)

  const errors = {
    name: form.name.trim() ? '' : 'Indique o seu nome.',
    contact:
      isValidPhone(form.phone) || isValidEmail(form.email) ? '' : 'Indique um telemóvel ou um email válido.',
    message: form.message.trim() ? '' : 'Conte-nos o que produz ou vende.',
    consent: consent ? '' : 'É preciso aceitar para o mercado o poder contactar.',
  }
  const hasErrors = Object.values(errors).some(Boolean)

  useLayoutEffect(() => {
    if (!root.current) return
    controls.current = createPanel(root.current)
    return () => {
      controls.current?.kill()
    }
  }, [])

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

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => () => unlock.current?.(), [])

  const update = (patch: Partial<Application>) => setForm((current) => ({ ...current, ...patch }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (hasErrors) {
      setShowErrors(true)
      return
    }
    void sendApplication(form)
    setSent(true)
    setForm(empty)
    setConsent(false)
    setShowErrors(false)
    if (root.current) revealPanelContent(root.current)
  }

  const close = () => {
    onClose()
    setSent(false)
  }

  return createPortal(
    <div ref={root} className="drawer join-form" role="dialog" aria-modal="true" aria-labelledby="join-form-title" inert={!open}>
      <div className="drawer__backdrop" data-panel="backdrop" onClick={close} />

      <aside className="drawer__panel join-form__panel" data-panel="body">
        <header className="join-form__head">
          <h2 id="join-form-title" className="join-form__title">
            {sent ? 'Candidatura enviada' : 'Quero vender no mercado'}
          </h2>
          <button ref={closeButton} className="drawer__close label" type="button" onClick={close}>
            Fechar
          </button>
        </header>

        {sent ? (
          <div className="join-form__done">
            <p data-panel="item">
              Obrigado! A equipa do mercado vai ler a sua candidatura e entra em contacto nos próximos dias para
              combinar uma conversa e uma visita.
            </p>
            <button type="button" className="join-form__submit" data-panel="item" onClick={close}>
              Continuar a explorar
            </button>
          </div>
        ) : (
          <form className="join-form__form" onSubmit={submit} noValidate>
            <p className="join-form__lead" data-panel="item">
              Leva dois minutos. Sem compromisso: é só para nos conhecermos.
            </p>

            <fieldset className="join-form__group" data-panel="item">
              <legend className="label">Sobre si</legend>
              <label>
                <span className="label">Nome</span>
                <input
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  aria-invalid={showErrors && !!errors.name}
                  onChange={(event) => update({ name: event.target.value })}
                />
                {showErrors && errors.name && <span className="join-form__error">{errors.name}</span>}
              </label>
              <div className="join-form__pair">
                <label>
                  <span className="label">Telemóvel</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(event) => update({ phone: event.target.value })}
                  />
                </label>
                <label>
                  <span className="label">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => update({ email: event.target.value })}
                  />
                </label>
              </div>
              {showErrors && errors.contact && <span className="join-form__error">{errors.contact}</span>}
            </fieldset>

            <fieldset className="join-form__group" data-panel="item">
              <legend className="label">Sobre o negócio</legend>
              <div className="join-form__pair">
                <label>
                  <span className="label">Nome do negócio (opcional)</span>
                  <input type="text" value={form.business} onChange={(event) => update({ business: event.target.value })} />
                </label>
                <label>
                  <span className="label">Localidade</span>
                  <input type="text" value={form.origin} onChange={(event) => update({ origin: event.target.value })} />
                </label>
              </div>
              <label>
                <span className="label">Categoria</span>
                <select value={form.category} onChange={(event) => update({ category: event.target.value })}>
                  {categories.map((category) => (
                    <option key={category.id}>{category.label}</option>
                  ))}
                  <option>Outra</option>
                </select>
              </label>
              <div className="join-form__kinds" role="radiogroup" aria-label="Tipo de venda">
                {(
                  [
                    ['produtor', 'Produção própria'],
                    ['comerciante', 'Revenda'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="join-form__kind">
                    <input
                      type="radio"
                      name="kind"
                      checked={form.kind === value}
                      onChange={() => update({ kind: value })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <label>
                <span className="label">O que produz ou vende</span>
                <textarea
                  rows={4}
                  value={form.message}
                  placeholder="Ex.: legumes da época, de uma horta familiar em Alcains."
                  aria-invalid={showErrors && !!errors.message}
                  onChange={(event) => update({ message: event.target.value })}
                />
                {showErrors && errors.message && <span className="join-form__error">{errors.message}</span>}
              </label>
            </fieldset>

            <div className="join-form__footer" data-panel="item">
              <label className="join-form__consent">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>Aceito que o Mercado Municipal use estes dados para me contactar sobre esta candidatura.</span>
              </label>
              {showErrors && errors.consent && <span className="join-form__error">{errors.consent}</span>}
              <button type="submit" className="join-form__submit">
                Enviar candidatura
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>,
    document.body,
  )
}
