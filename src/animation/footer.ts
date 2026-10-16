import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
 * Footer: the columns settle in, then the large wordmark rises letter by letter
 * as the bottom of the page arrives. Elements are targeted by data-footer="…".
 */

const MOTION = '(prefers-reduced-motion: no-preference)'

export function createFooter(root: HTMLElement): () => void {
  const mm = gsap.matchMedia(root)

  mm.add(MOTION, () => {
    const columns = gsap.utils.toArray<HTMLElement>('[data-footer="column"]', root)
    const chars = gsap.utils.toArray<HTMLElement>('[data-footer="char"]', root)
    gsap.set(columns, { autoAlpha: 0, y: 24 })
    gsap.set(chars, { yPercent: 105 })

    // Explicit start and end values, so each tween always has something to animate
    gsap.fromTo(
      columns,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: root, start: 'top 85%', end: 'top 45%', scrub: 1 },
      },
    )
    gsap.fromTo(
      chars,
      // y: 0 clears any pixel offset left behind by a previous mount (React StrictMode)
      { yPercent: 105, y: 0 },
      {
        yPercent: 0,
        y: 0,
        stagger: 0.04,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.querySelector('.footer__wordmark'), start: 'top bottom', end: 'bottom bottom', scrub: 1 },
      },
    )
  })

  return () => mm.revert()
}
