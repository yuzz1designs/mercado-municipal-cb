import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
 * "Visitar" section.
 *   Lens  — the green of the producers opens in a circle centred on the building's
 *           sign, while the illustration pulls back from a close-up of it.
 *   Title — written in from the left; the panel slides in from the right.
 *   Scene — the illustration builds in layers: sky and town, the block rising,
 *           the vault, the wing stretching out, trees and lamp, the sign last.
 *   Life  — while on screen: clouds drift, the sun breathes, birds cross the sky,
 *           the banner waves and the trees sway.
 * Elements are targeted by data-visit="…".
 */

const SCRUB = 1

/** The "Mercado Municipal" sign on the illustration, as a fraction of its width / height (see VisitScene) */
const FOCUS = { x: 560 / 1200, y: 465 / 900 }

/** How close the camera starts on the sign */
const ZOOM = 1.8
const MOTION = '(prefers-reduced-motion: no-preference)'

const el = (name: string) => `[data-visit="${name}"]`
const all = (root: Element, name: string) => gsap.utils.toArray<SVGElement>(el(name), root)

export function createVisit(root: HTMLElement): () => void {
  const mm = gsap.matchMedia(root)

  mm.add(MOTION, () => {
    const sheet = root.querySelector<HTMLElement>(el('sheet'))!
    const mapBox = root.querySelector<HTMLElement>(el('map'))!
    const zoom = root.querySelector(el('zoom'))

    // Centre of the iris: the building's sign, measured on the (unscaled) frame
    const centre = () => {
      const s = sheet.getBoundingClientRect()
      const m = mapBox.querySelector('.visit__frame')!.getBoundingClientRect()
      return { x: m.left - s.left + m.width * FOCUS.x, y: m.top - s.top + m.height * FOCUS.y }
    }
    const iris = (open: boolean) => () => {
      const { x, y } = centre()
      const radius = open ? Math.hypot(Math.max(x, sheet.offsetWidth - x), Math.max(y, sheet.offsetHeight - y)) : 0
      return `circle(${radius}px at ${x}px ${y}px)`
    }

    const lines = all(root, 'title-line')
    const items = [...all(root, 'fade'), ...gsap.utils.toArray<HTMLElement>('.visit__panel > *', root)]
    gsap.set(lines, { clipPath: 'inset(0% 100% 0% 0%)', x: -24 })
    gsap.set(items, { autoAlpha: 0, x: 40 })

    gsap
      .timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: mapBox,
          start: 'top 95%',
          end: 'top 45%',
          scrub: SCRUB,
          invalidateOnRefresh: true,
        },
      })
      // A lens opens from the market onto the whole section…
      .fromTo(sheet, { clipPath: iris(false) }, { clipPath: iris(true), duration: 0.75, ease: 'power2.in' }, 0)
      // …while the camera pulls back from the market
      .fromTo(
        zoom,
        { scale: ZOOM, transformOrigin: `${FOCUS.x * 100}% ${FOCUS.y * 100}%` },
        { scale: 1, duration: 0.85, ease: 'power2.inOut' },
        0,
      )
      // The title is written in, the panel slides in from the right
      .to(lines, { clipPath: 'inset(0% 0% 0% 0%)', x: 0, stagger: 0.12, duration: 0.35 }, 0.5)
      .to(items, { autoAlpha: 1, x: 0, stagger: 0.04, duration: 0.3 }, 0.55)

    // The scene builds itself in layers: sky and town, vault, block, wing, trees, sign
    const part = (name: string) => all(root, name)
    gsap.set(part('far'), { autoAlpha: 0, y: 30 })
    gsap.set(part('vault'), { autoAlpha: 0, y: 40 })
    gsap.set(part('building'), { scaleY: 0.4, autoAlpha: 0, transformOrigin: '50% 100%' })
    gsap.set(part('wing'), { scaleX: 0.3, autoAlpha: 0, transformOrigin: '0% 100%' })
    gsap.set(part('trees'), { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 100%' })
    gsap.set(part('lamp'), { autoAlpha: 0, y: 30 })
    gsap.set(part('front'), { autoAlpha: 0 })
    gsap.set(part('sign'), { autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%' })

    gsap
      .timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: mapBox, start: 'top 95%', end: 'top 35%', scrub: SCRUB },
      })
      .to(part('far'), { autoAlpha: 1, y: 0, duration: 0.3 }, 0)
      .to(part('front'), { autoAlpha: 1, duration: 0.25 }, 0.05)
      .to(part('building'), { scaleY: 1, autoAlpha: 1, duration: 0.35 }, 0.15)
      .to(part('vault'), { autoAlpha: 1, y: 0, duration: 0.3 }, 0.3)
      .to(part('wing'), { scaleX: 1, autoAlpha: 1, duration: 0.35 }, 0.35)
      .to(part('trees'), { scale: 1, autoAlpha: 1, duration: 0.3 }, 0.55)
      .to(part('lamp'), { autoAlpha: 1, y: 0, duration: 0.25 }, 0.6)
      .to(part('sign'), { autoAlpha: 1, scale: 1, duration: 0.25 }, 0.7)

    // Ambient life, only while the section is on screen
    const ambient: gsap.core.Tween[] = []
    const random = gsap.utils.random
    part('cloud').forEach((cloud) =>
      ambient.push(gsap.to(cloud, { x: `+=${random(60, 120)}`, duration: random(14, 22), ease: 'sine.inOut', yoyo: true, repeat: -1 })),
    )
    ambient.push(
      gsap.to(part('sun'), { scale: 1.06, transformOrigin: '50% 50%', duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
    )
    part('bird').forEach((bird, index) => {
      ambient.push(
        gsap.fromTo(
          bird,
          { x: -80 },
          { x: 1280, y: `+=${random(-30, 30)}`, duration: random(16, 24), ease: 'none', repeat: -1, delay: index * 2.5 },
        ),
        gsap.to(bird.querySelector('[data-visit="wings"]'), {
          scaleY: -0.5,
          transformOrigin: '50% 60%',
          duration: random(0.22, 0.32),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }),
      )
    })
    ambient.push(
      gsap.fromTo(
        part('banner'),
        { skewY: -3 },
        { skewY: 3, transformOrigin: '50% 0%', duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 },
      ),
    )
    part('tree').forEach((tree) =>
      ambient.push(
        gsap.fromTo(
          tree,
          { rotation: -1.2 },
          { rotation: 1.2, transformOrigin: '50% 100%', duration: random(3, 4.5), ease: 'sine.inOut', yoyo: true, repeat: -1 },
        ),
      ),
    )
    ambient.forEach((tween) => tween.pause())
    ScrollTrigger.create({
      trigger: mapBox,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => ambient.forEach((tween) => (self.isActive ? tween.resume() : tween.pause())),
    })
  })

  ScrollTrigger.refresh()
  return () => mm.revert()
}
