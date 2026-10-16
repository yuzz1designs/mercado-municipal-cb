import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
 * Regional products section.
 *   1 — the section rises over the market walk like a sheet of paper;
 *   2 — the title is revealed line by line, while product sketches draw
 *       themselves in a loop (time-based, only while the intro is on screen);
 *   3 — desktop: a sticky showcase where each product's photograph is laid over
 *       the previous one while the index, counter and description follow.
 * Elements are targeted by data-products="…".
 */

const SCRUB = 1

/** Within each step of the showcase (1 = one screen of scroll): when the change starts and how long it takes. */
const STEP = { start: 0.2, duration: 0.6 }

const MEDIA = {
  desktop: '(min-width: 1024px)',
  motion: '(prefers-reduced-motion: no-preference)',
}

/** Showcase palettes (mirror the --products-* defaults in Products.css). */
const TONES = {
  light: {
    '--products-bg': '#f3efe6',
    '--products-ink': '#154a35',
    '--products-muted': 'rgba(10, 33, 25, 0.62)',
    '--products-tag-bg': '#154a35',
    '--products-tag-ink': '#fcfbf7',
  },
  green: {
    '--products-bg': '#154a35',
    '--products-ink': '#fcfbf7',
    '--products-muted': 'rgba(252, 251, 247, 0.74)',
    '--products-tag-bg': '#f3efe6',
    '--products-tag-ink': '#154a35',
  },
}

const el = (name: string) => `[data-products="${name}"]`
const all = (root: HTMLElement, name: string) => gsap.utils.toArray<HTMLElement>(el(name), root)

export function createProducts(root: HTMLElement): () => void {
  const mm = gsap.matchMedia(root)

  mm.add(MEDIA, (context) => {
    const { desktop, motion } = context.conditions as Record<keyof typeof MEDIA, boolean>

    sketches(root, motion)

    if (motion) {
      sheet(root)
      intro(root)
    } else {
      gsap.set(root, { '--sheet-x': '0vw', '--sheet-r': '0rem' })
    }

    if (desktop) return showcase(root, motion)
    if (motion) list(root)
  })

  ScrollTrigger.refresh()
  return () => mm.revert()
}

function sheet(root: HTMLElement) {
  gsap.to(root, {
    '--sheet-x': '0vw',
    '--sheet-r': '0rem',
    ease: 'power2.in',
    scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: SCRUB },
  })
}

function intro(root: HTMLElement) {
  const lines = all(root, 'title-line')
  const lead = all(root, 'lead')
  gsap.set(lines, { yPercent: 110 })
  gsap.set(lead, { autoAlpha: 0, y: 24 })

  gsap
    .timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: root, start: 'top 70%', end: 'top 5%', scrub: SCRUB },
    })
    .to(lines, { yPercent: 0, stagger: 0.15, duration: 0.7 }, 0)
    .to(lead, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.4)
}

/** Seconds each sketch takes to draw, and how long it stays before giving way to the next. */
const SKETCH = { draw: 2.2, hold: 1.8, out: 0.8 }

/**
 * Product sketches drawn stroke by stroke, one after another, in a loop.
 * Reduced motion: no drawing, just a slow cross-fade.
 */
function sketches(root: HTMLElement, motion: boolean) {
  const figures = all(root, 'sketch')
  const names = all(root, 'sketch-name')
  const disc = root.querySelector(el('sketch-disc'))
  if (!figures.length) return
  gsap.set(figures, { autoAlpha: 0 })

  const loop = gsap.timeline({ repeat: -1, paused: true })
  figures.forEach((figure, index) => {
    const paths = Array.from(figure.querySelectorAll('path'))
    const name = names[index]
    loop.set(figure, { autoAlpha: 1, y: 0 }).to(name, { opacity: 1, duration: 0.6 }, '<')

    if (motion) {
      for (const path of paths) {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      }
      loop
        // The disc breathes in as each new drawing starts
        .fromTo(disc, { scale: 0.94 }, { scale: 1, duration: SKETCH.draw, ease: 'expo.out' }, '<')
        .to(
          paths,
          {
            strokeDashoffset: 0,
            ease: 'power1.inOut',
            duration: SKETCH.draw / 2,
            stagger: SKETCH.draw / 2 / paths.length,
          },
          '<',
        )
        .to(figure, { autoAlpha: 0, y: -10, duration: SKETCH.out, ease: 'power2.in' }, `+=${SKETCH.hold}`)
    } else {
      loop.to(figure, { autoAlpha: 0, duration: SKETCH.out }, `+=${SKETCH.draw + SKETCH.hold}`)
    }
    loop.to(name, { opacity: 0.28, duration: SKETCH.out }, '<')
  })

  // Only run while the intro is visible
  ScrollTrigger.create({
    trigger: root.querySelector(el('intro')),
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
  })
}

/** Sticky stage: one product per screen of scroll. */
function showcase(root: HTMLElement, motion: boolean) {
  const media = all(root, 'media')
  const photos = all(root, 'photo')
  const bodies = all(root, 'body')
  const index = all(root, 'index-item')
  const counter = root.querySelector<HTMLElement>(el('counter'))
  const tones = all(root, 'item').map((item) => (item.dataset.tone === 'green' ? 'green' : 'light'))
  const header = document.querySelector<HTMLElement>('[data-entrance="header"]')
  const count = media.length

  // Everything after the first product starts hidden
  const later = <T,>(list: T[]) => list.slice(1)
  if (motion) {
    gsap.set(later(media), { clipPath: 'inset(100% 0% 0% 0%)' })
    gsap.set(later(photos), { scale: 1.2 })
  } else {
    gsap.set(later(media), { autoAlpha: 0 })
  }
  gsap.set(later(bodies), { autoAlpha: 0, y: motion ? 24 : 0 })
  gsap.set(index[0], { opacity: 1, x: 12 })

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut', duration: STEP.duration },
    scrollTrigger: {
      trigger: root.querySelector(el('showcase')),
      start: 'top top',
      end: 'bottom bottom',
      scrub: motion ? SCRUB : true,
    },
    // Keep the header legible: light text while the showcase is green
    onUpdate() {
      const active = Math.round(gsap.utils.clamp(0, count - 1, this.time() - STEP.start - STEP.duration / 2 + 0.5))
      // Only while the showcase is on screen: other light sections need the dark header back
      const inShowcase = tl.scrollTrigger?.isActive ?? false
      header?.classList.toggle('is-on-green', inShowcase && tones[active] === 'green')
    },
  })
  // Leaving the showcase (either way) always hands the header back
  ScrollTrigger.create({
    trigger: root.querySelector(el('showcase')),
    start: 'top top',
    end: 'bottom bottom',
    onLeave: () => header?.classList.remove('is-on-green'),
    onLeaveBack: () => header?.classList.remove('is-on-green'),
  })

  for (let i = 1; i < count; i++) {
    const at = i - 1 + STEP.start

    if (motion) {
      tl.to(media[i], { clipPath: 'inset(0% 0% 0% 0%)' }, at)
        .to(photos[i], { scale: 1, ease: 'power2.out' }, at)
        .to(photos[i - 1], { scale: 1.06 }, at)
    } else {
      tl.to(media[i], { autoAlpha: 1 }, at)
    }

    tl.to(bodies[i - 1], { autoAlpha: 0, y: motion ? -16 : 0, duration: STEP.duration * 0.45 }, at)
      .to(bodies[i], { autoAlpha: 1, y: 0, duration: STEP.duration * 0.55 }, at + STEP.duration * 0.45)
      .to(index[i - 1], { opacity: 0.22, x: 0 }, at)
      .to(index[i], { opacity: 1, x: 12 }, at)

    if (counter) tl.to(counter, { yPercent: (-100 / count) * i }, at)
    if (tones[i] !== tones[i - 1]) tl.to(root, { ...TONES[tones[i]] }, at)
  }

  // Hold the last product until the stage releases
  tl.set({}, {}, count - 1)

  return () => header?.classList.remove('is-on-green')
}

/** Below desktop: each photograph opens as it scrolls into view. */
function list(root: HTMLElement) {
  for (const [i, media] of all(root, 'media').entries()) {
    const photo = all(root, 'photo')[i]
    const body = all(root, 'body')[i]
    gsap
      .timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: media, start: 'top 92%', end: 'top 30%', scrub: SCRUB },
      })
      .fromTo(
        media,
        { clipPath: 'inset(12% 8% 12% 8% round 12px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 6px)' },
        0,
      )
      .fromTo(photo, { scale: 1.2 }, { scale: 1 }, 0)
      .fromTo(body, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0 }, 0.4)
  }
}
