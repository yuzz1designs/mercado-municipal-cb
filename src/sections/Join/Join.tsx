import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createJoin } from '../../animation/join'
import { join } from '../../content/join'
import { JoinBackdrop } from './JoinBackdrop'
import { JoinForm } from './JoinForm'
import { JoinStall } from './JoinStall'
import './Join.css'

const pad = (value: number) => String(value).padStart(2, '0')
const mailto = `mailto:${join.email}?subject=${encodeURIComponent(join.emailSubject)}`

/** Call for new stallholders: the process, free stalls, a form and an email link. */
export function Join() {
  const root = useRef<HTMLElement>(null)
  const [formOpen, setFormOpen] = useState(false)
  const closeForm = useCallback(() => setFormOpen(false), [])

  useLayoutEffect(() => {
    if (!root.current) return
    return createJoin(root.current)
  }, [])

  return (
    <section ref={root} id="vender" className="join" aria-labelledby="join-title">
      <JoinBackdrop />
      {/* Paper "blind" that rolls up as the section arrives */}
      <span className="join__wash" data-join="wash" aria-hidden="true" />

      <div className="join__inner">
        <div className="join__text">
          <p className="label join__kicker" data-join="fade">
            {join.kicker}
          </p>
          <h2 id="join-title" className="join__title">
            {join.title.map((word) => (
              <span className="join__mask" key={word}>
                <span data-join="word">{word}</span>
              </span>
            ))}
          </h2>
          <p className="join__lead" data-join="fade">
            {join.lead}
          </p>

          <ol className="join__steps">
            {join.steps.map((step, index) => (
              <li key={step.title} data-join="step">
                <span className="label">{pad(index + 1)}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="join__actions" data-join="fade">
            <button type="button" className="join__primary" onClick={() => setFormOpen(true)}>
              Preencher formulário
            </button>
            <a className="join__secondary" href={mailto}>
              Enviar email
            </a>
            <p className="join__free">
              <strong>{join.freeStalls}</strong> bancas livres neste momento
            </p>
          </div>
        </div>

        <div className="join__art" data-join="art">
          <JoinStall />
        </div>
      </div>

      <JoinForm open={formOpen} onClose={closeForm} />
    </section>
  )
}
