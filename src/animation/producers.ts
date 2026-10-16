import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, Flip)

/*
 * Producers section.
 *   Scroll  — title lines, lead and a hairline are scrubbed in; the featured
 *             carousel opens with the scroll (see carousel.ts); rows and stalls rise in as they enter the screen.
 *   Stats   — count up on their own (time-based) once they reach the screen.
 *   Filter  — the list re-flows with Flip (rows glide to their new place).
 *   Drawer  — the producer card uses the shared side panel (see panel.ts).
 * Elements are targeted by data-producers="…".
 */

const SCRUB = 1
const MOTION = '(prefers-reduced-motion: no-preference)'

const el = (name: string) => `[data-producers="${name}"]`
const all = (root: Element, name: string) => gsap.utils.toArray<HTMLElement>(el(name), root)
const prefersMotion = () => window.matchMedia(MOTION).matches

export function createProducers(root: HTMLElement): () => void {
  const mm = gsap.matchMedia(root)

  mm.add(MOTION, () => {
    const intro = root.querySelector(el('intro'))
    const lines = all(root, 'title-line')
    const fades = all(root, 'fade')
    gsap.set(lines, { yPercent: 110 })
    gsap.set(fades, { autoAlpha: 0, y: 24 })

    gsap
      .timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: intro, start: 'top 85%', end: 'top 15%', scrub: SCRUB },
      })
      .fromTo(el('rule'), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power2.inOut' }, 0)
      .to(lines, { yPercent: 0, stagger: 0.15, duration: 0.7 }, 0.1)
      .to(fades, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.5 }, 0.45)

    // The featured carousel opens with the scroll, like a sheet
    const band = root.querySelector(el('band'))
    gsap.fromTo(
      band,
      { clipPath: 'inset(8% 5% 8% 5% round 24px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        ease: 'power2.out',
        scrollTrigger: { trigger: band, start: 'top 95%', end: 'top 15%', scrub: SCRUB },
      },
    )

    // Rows and stalls rise in as they reach the screen
    const rise = (targets: HTMLElement[], from: gsap.TweenVars) =>
      ScrollTrigger.batch(targets, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(batch, from, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.05, duration: 0.9, ease: 'expo.out' }),
      })
    rise(all(root, 'row'), { autoAlpha: 0, y: 40 })
    rise(all(root, 'stall'), { autoAlpha: 0, scale: 0.6 })
  })

  // Stats count up by themselves once they reach the screen (reduced motion: shown as is)
  mm.add(MOTION, () => {
    const stats = all(root, 'stat')
    for (const stat of stats) {
      const value = Number(stat.dataset.value)
      const counter = { value: 0 }
      stat.textContent = '0'
      ScrollTrigger.create({
        trigger: stat,
        start: 'top 88%',
        once: true,
        onEnter: () =>
          gsap.to(counter, {
            value,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => (stat.textContent = String(Math.round(counter.value))),
          }),
      })
    }
    return () => stats.forEach((stat) => (stat.textContent = stat.dataset.value ?? ''))
  })

  ScrollTrigger.refresh()
  return () => mm.revert()
}

/** Captures the list layout before a filter change. */
export const captureList = (list: HTMLElement) => Flip.getState(all(list, 'row'))

/** Glides rows to their new place after a filter change; new rows rise in, removed ones fade. */
export function reflowList(state: Flip.FlipState, list: HTMLElement) {
  if (!prefersMotion()) return
  Flip.from(state, {
    targets: all(list, 'row'),
    duration: 0.8,
    ease: 'expo.inOut',
    absolute: true,
    nested: true,
    onEnter: (rows) => gsap.fromTo(rows, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.2, ease: 'expo.out' }),
    onLeave: (rows) => gsap.to(rows, { autoAlpha: 0, duration: 0.3 }),
  })
}
