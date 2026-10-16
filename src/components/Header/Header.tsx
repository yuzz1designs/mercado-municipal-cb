import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { scrollToHome } from '../../animation/entrance'
import { watchHeaderScroll, watchHeaderTheme } from '../../animation/headerTheme'
import { pulse } from '../../animation/panel'
import { useBag } from '../../bag/BagContext'
import { site } from '../../content/site'
import { lockScroll } from '../../lib/scrollLock'
import './Header.css'

export function Header() {
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)
  const bagCount = useRef<HTMLSpanElement>(null)
  const bag = useBag()
  const previousCount = useRef(bag.count)

  // The count pops when something is added
  useEffect(() => {
    if (bag.count > previousCount.current) pulse(bagCount.current)
    previousCount.current = bag.count
  }, [bag.count])

  useLayoutEffect(() => {
    if (!header.current) return
    const stopTheme = watchHeaderTheme(header.current)
    const stopScroll = watchHeaderScroll(header.current)
    return () => {
      stopTheme()
      stopScroll()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    const unlock = lockScroll()
    window.addEventListener('keydown', onKey)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header ref={header} className={open ? 'header is-open' : 'header'} data-entrance="header">
      <a
        className="header__brand"
        href="#inicio"
        aria-label={`${site.name} de ${site.place} — início`}
        onClick={(event) => {
          event.preventDefault()
          setOpen(false)
          scrollToHome()
        }}
      >
        <span className="header__name">{site.name}</span>
        <span className="label">{site.place}</span>
      </a>

      <img className="header__owner" src={site.owner.logo} alt={site.owner.name} width="2000" height="936" />

      <button
        className="header__toggle label"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Fechar' : 'Menu'}
      </button>

      <nav id="site-nav" className="header__nav" aria-label="Principal">
        <ul>
          {site.nav.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className="header__bag"
        onClick={() => {
          setOpen(false)
          bag.open()
        }}
        aria-label={`Saco de compras, ${bag.count} ${bag.count === 1 ? 'produto' : 'produtos'}`}
      >
        <span className="header__bag-icon" aria-hidden="true" />
        <span className="header__bag-label">Saco</span>
        <span ref={bagCount} className="header__bag-count" aria-hidden="true">
          {bag.count}
        </span>
      </button>
    </header>
  )
}
