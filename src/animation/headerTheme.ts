import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Switches the header to dark text while a section marked data-header="dark"
 * sits underneath it.
 */
export function watchHeaderTheme(header: HTMLElement): () => void {
  const offset = () => header.offsetHeight / 2
  const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-header="dark"]'), (section) =>
    ScrollTrigger.create({
      trigger: section,
      start: () => `top ${offset()}px`,
      end: () => `bottom ${offset()}px`,
      toggleClass: { targets: header, className: 'is-dark' },
    }),
  )
  return () => triggers.forEach((trigger) => trigger.kill())
}

/** Scroll distance (px) in one direction before the header hides or comes back. */
const SCROLL_INTENT = 6

/**
 * Header behaviour once the page content starts (the products section):
 *   is-solid  — gets its own background instead of floating over the content;
 *   is-hidden — slides away while scrolling down, comes back as soon as you scroll up.
 * Over the Home (Hero and market walk) it stays transparent and always visible.
 * It never hides while the menu or a panel is open, or while it has keyboard focus.
 */
export function watchHeaderScroll(header: HTMLElement): () => void {
  const content = document.getElementById('produtos')
  let last = window.scrollY

  // Runs straight from the scroll event: browsers already fire it at most once per frame,
  // and the work is just a few class toggles
  const update = () => {
    const y = window.scrollY
    const solid = content ? content.getBoundingClientRect().top <= header.offsetHeight : y > 80
    header.classList.toggle('is-solid', solid)

    const busy =
      header.classList.contains('is-open') ||
      document.documentElement.classList.contains('is-locked') ||
      header.contains(document.activeElement)
    const delta = y - last
    if (!solid || busy) header.classList.remove('is-hidden')
    else if (delta > SCROLL_INTENT) header.classList.add('is-hidden')
    else if (delta < -SCROLL_INTENT) header.classList.remove('is-hidden')
    if (Math.abs(delta) > SCROLL_INTENT) last = y
  }

  const onFocus = () => header.classList.remove('is-hidden')

  window.addEventListener('scroll', update, { passive: true })
  header.addEventListener('focusin', onFocus)
  update()
  return () => {
    window.removeEventListener('scroll', update)
    header.removeEventListener('focusin', onFocus)
  }
}
