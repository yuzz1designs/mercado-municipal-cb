import { useLayoutEffect, useRef } from 'react'
import { createFooter } from '../../animation/footer'
import { useBag } from '../../bag/BagContext'
import { join } from '../../content/join'
import { site } from '../../content/site'
import { visit } from '../../content/visit'
import { groupHours } from '../../lib/hours'
import './Footer.css'

const schedule = groupHours()
const WORDMARK = 'Mercado Municipal'

/** Site footer: navigation, visit details, contacts, the municipality and a large wordmark. */
export function Footer() {
  const root = useRef<HTMLElement>(null)
  const bag = useBag()

  useLayoutEffect(() => {
    if (!root.current) return
    return createFooter(root.current)
  }, [])

  return (
    <footer ref={root} className="footer">
      <div className="footer__top">
        <div className="footer__intro" data-footer="column">
          <p className="footer__lead">
            Produtos da região, <em>vendidos por quem os faz.</em>
          </p>
          <img className="footer__owner" src={site.owner.logo} alt={site.owner.name} width="2000" height="936" />
        </div>

        <nav className="footer__column" aria-label="Rodapé" data-footer="column">
          <h2 className="label">Navegar</h2>
          <ul>
            {site.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__column" data-footer="column">
          <h2 className="label">Visitar</h2>
          <address>
            {visit.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <ul className="footer__hours">
            {schedule.map((group) => (
              <li key={group.label}>
                <span>{group.label}</span>
                <span>{group.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__column" data-footer="column">
          <h2 className="label">Contactos</h2>
          <ul>
            <li>
              <a href={`tel:+351${visit.phone.replace(/\s/g, '')}`}>{visit.phone}</a>
            </li>
            <li>
              <a href={`mailto:${join.email}`}>{join.email}</a>
            </li>
            <li>
              <a href="#vender">Quero vender no mercado</a>
            </li>
            <li>
              <button type="button" onClick={bag.open}>
                O meu saco
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Large wordmark, rising letter by letter */}
      <p className="footer__wordmark" aria-hidden="true">
        {WORDMARK.split('').map((char, index) => (
          <span className="footer__char-mask" key={index}>
            <span data-footer="char">{char === ' ' ? ' ' : char}</span>
          </span>
        ))}
      </p>

      <div className="footer__bottom">
        <p>
          © {new Date().getFullYear()} {site.owner.name}
        </p>
        <ul>
          {/* PLACEHOLDER pages */}
          <li>
            <a href="#privacidade">Privacidade</a>
          </li>
          <li>
            <a href="#acessibilidade">Acessibilidade</a>
          </li>
        </ul>
        <button type="button" className="footer__top-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Voltar ao topo ↑
        </button>
      </div>
    </footer>
  )
}
