import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { trackWalk } from './walk'

gsap.registerPlugin(ScrollTrigger)

/*
 * Welcome → Hero → walk through the market.
 * After the Hero the page stops going down: the stage stays put and scrolling
 * pans the panorama sideways; points of interest and wind are handled in walk.ts.
 *
 * Everything that moves lives here. Elements are targeted by data attributes:
 *   data-intro="…"     → animated once, on load
 *   data-entrance="…"  → scrubbed by scroll
 * The two sets never share an element, so they never fight over a property.
 */

/** Mirrors the easing tokens in styles/tokens.css. */
const EASE = {
  reveal: 'expo.out',
  curtain: 'expo.inOut',
  drift: 'power1.inOut',
  open: 'power2.inOut',
  settle: 'power2.out',
}

/** Seconds the timeline takes to catch up with the scrollbar — the "weight" of the scroll. */
const SCRUB = 1.2

type Phase = readonly [start: number, end: number]

/**
 * Scroll phases, measured in viewports of scroll (1 = one screen height).
 * Retime the sequence here; the scroll track grows to fit LENGTH.
 */
const PHASES = {
  // Welcome
  cue: [0, 0.2],
  place: [0.15, 0.85],
  words: [0.25, 1.55],
  open: [0.5, 2],
  welcomeOut: [1.25, 1.8],
  // Hero
  tint: [1.5, 2.2],
  hero: [1.7, 2.45],
  header: [2, 2.5],
  // Walk: scrolling becomes a sideways pan
  heroOut: [2.9, 3.5],
  walk: [3, 7.5],
  spots: [3.2, 3.5],
  // The products section rises over the market (see Products.css)
  cover: [7.7, 8.7],
} satisfies Record<string, Phase>

/** Opacity of the dark tint over the panorama during the walk (1 = as dark as in the Hero). */
const WALK_TINT = 0.4

/** Where "home" is: the Hero fully settled with the header in, before the walk starts. */
const HOME = 2.7

/** Total scroll length. The last screen overlaps the next section, which covers the stage. */
const LENGTH = 8.7

const MEDIA = {
  desktop: '(min-width: 768px)',
  motion: '(prefers-reduced-motion: no-preference)',
}

const el = (name: string) => `[data-entrance="${name}"]`
const len = ([start, end]: Phase) => end - start

const walkSpots = (root: HTMLElement) => gsap.utils.toArray<HTMLElement>(el('spot'), root)

/** The header lives outside the entrance root (it is site-wide), so it is queried globally. */
const siteHeader = () => document.querySelectorAll<HTMLElement>(el('header'))

export function createEntrance(root: HTMLElement): () => void {
  root.style.setProperty('--entrance-length', String(LENGTH))
  const mm = gsap.matchMedia(root)

  mm.add(MEDIA.motion, playIntro)

  mm.add(MEDIA, (context) => {
    const { desktop, motion } = context.conditions as Record<keyof typeof MEDIA, boolean>
    return motion ? buildScroll(root, desktop ? 1 : 0.55) : buildReducedScroll(root)
  })

  // Measure right away: a trigger created after another was killed (React StrictMode
  // mounts twice) can otherwise wait indefinitely for its first refresh.
  ScrollTrigger.refresh()

  return () => mm.revert()
}

function playIntro() {
  gsap
    .timeline({ delay: 0.2, defaults: { ease: EASE.reveal } })
    .fromTo(
      '[data-intro="frame"]',
      { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.2 },
      { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 2.2, ease: EASE.curtain },
      0,
    )
    .from('[data-intro="line"]', { yPercent: 110, duration: 1.8, stagger: 0.14 }, 0.45)
    .from('[data-intro="fade"]', { autoAlpha: 0, y: 14, duration: 1.4, stagger: 0.12 }, 1.2)
}

function scrollTimeline(root: HTMLElement, scrub: number | true) {
  return gsap.timeline({
    defaults: { ease: EASE.drift },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub,
      invalidateOnRefresh: true,
    },
  })
}

/**
 * Staggered fromTo inside a scrubbed timeline only pre-renders its first target,
 * so the start state is applied to all of them up front.
 */
function staggerFromTo(
  tl: gsap.core.Timeline,
  targets: gsap.TweenTarget,
  from: gsap.TweenVars,
  to: gsap.TweenVars,
  position: number,
) {
  gsap.set(targets, from)
  return tl.fromTo(targets, from, to, position)
}

/**
 * travel scales how far the Welcome type drifts (smaller on mobile).
 */
function buildScroll(root: HTMLElement, travel: number) {
  const { cue, place, words, open, welcomeOut, tint, hero, header, heroOut, walk, spots, cover } = PHASES
  const heroLines = gsap.utils.toArray<HTMLElement>(el('hero-line'), root)
  const lineStagger = 0.08
  const media = root.querySelector<HTMLElement>(el('hero-media'))!
  const track = root.querySelector<HTMLElement>(el('hero-track'))!

  const tl = scrollTimeline(root, SCRUB)

  // 1 — Welcome: the type parts like a curtain around the photograph
  tl.to(el('cue'), { autoAlpha: 0, y: 16, duration: len(cue) }, cue[0])
    .to(el('welcome-meta'), { autoAlpha: 0, duration: len(cue) }, cue[0])
    .to(el('welcome-place'), { autoAlpha: 0, yPercent: -60, duration: len(place) }, place[0])
    .to(
      el('welcome-top'),
      { xPercent: -6 * travel, yPercent: -90 * travel, scale: 0.82, duration: len(words) },
      words[0],
    )
    .to(
      el('welcome-bottom'),
      { xPercent: 6 * travel, yPercent: 90 * travel, scale: 0.82, duration: len(words) },
      words[0],
    )

    // 2 — The photograph window opens to full bleed, settling its scale
    .to(
      media,
      {
        '--clip-t': '0%',
        '--clip-r': '0%',
        '--clip-b': '0%',
        '--clip-l': '0%',
        '--clip-radius': '0px',
        ease: EASE.open,
        duration: len(open),
      },
      open[0],
    )
    .fromTo(track, { scale: 1.32 }, { scale: 1.08, ease: EASE.open, duration: len(open) }, open[0])
    .to(el('welcome'), { autoAlpha: 0, duration: len(welcomeOut) }, welcomeOut[0])

    // 3 — Hero takes over the viewport
    .fromTo(el('hero-tint'), { autoAlpha: 0 }, { autoAlpha: 1, duration: len(tint) }, tint[0])
    .to(track, { scale: 1, ease: EASE.settle, duration: len(hero) }, hero[0])
    .fromTo(
      el('hero-fade'),
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, ease: EASE.settle, duration: len(hero) - 0.15 },
      hero[0] + 0.15,
    )

    // The site header arrives once the Hero has settled.
    // Opacity only: a transform would trap the fixed mobile menu inside the header box.
    .fromTo(siteHeader(), { autoAlpha: 0 }, { autoAlpha: 1, ease: EASE.settle, duration: len(header) }, header[0])

    // 4 — Walk: the Hero copy slides off with the scene, then scroll pans the panorama
    .to(el('hero-content'), { x: () => -window.innerWidth * 0.4, autoAlpha: 0, ease: 'power1.in', duration: len(heroOut) }, heroOut[0])
    .to(track, { x: () => -(track.offsetWidth - media.offsetWidth), ease: 'none', duration: len(walk) }, walk[0])
    // The market brightens while walking through it
    .to(el('hero-tint'), { autoAlpha: WALK_TINT, duration: len(heroOut) }, heroOut[0])
    .fromTo(el('hero-spots'), { autoAlpha: 0 }, { autoAlpha: 1, duration: len(spots) }, spots[0])
    .fromTo(el('hero-wind'), { autoAlpha: 0 }, { autoAlpha: 1, duration: len(spots) }, walk[0])
    .fromTo(el('walk-progress'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, walk[0])
    .fromTo(el('walk-progress-fill'), { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: len(walk) }, walk[0])

    // 5 — Cover: the market sinks back and dims while the next section slides over it
    .to(el('walk-progress'), { autoAlpha: 0, duration: 0.3 }, cover[0])
    .set(el('stage'), { backgroundColor: '#0a2119' }, cover[0])
    .to(el('hero'), { yPercent: -14, ease: 'none', duration: len(cover) }, cover[0])
    .fromTo(el('hero-shade'), { autoAlpha: 0 }, { autoAlpha: 0.65, ease: 'none', duration: len(cover) }, cover[0])

  // The slider frames rise into place one after another
  const frames = gsap.utils.toArray<HTMLElement>(`${el('hero-slider')} [data-slider="frame"]`, root)
  staggerFromTo(
    tl,
    frames,
    { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 12 },
    { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, ease: EASE.settle, stagger: 0.1, duration: len(hero) - 0.2 },
    hero[0] - 0.15,
  )
  staggerFromTo(
    tl,
    gsap.utils.toArray<HTMLElement>(`${el('hero-slider')} [data-slider="captions"]`, root),
    { autoAlpha: 0, y: 16 },
    { autoAlpha: 1, y: 0, ease: EASE.settle, stagger: 0.1, duration: len(hero) - 0.3 },
    hero[0] + 0.15,
  )
  staggerFromTo(
    tl,
    heroLines,
    { yPercent: 110 },
    {
      yPercent: 0,
      ease: EASE.settle,
      stagger: lineStagger,
      duration: len(hero) - lineStagger * (heroLines.length - 1),
    },
    hero[0],
  )

  tl.set({}, {}, LENGTH)

  return trackWalk(track, walkSpots(root), root.querySelector<HTMLCanvasElement>(el('hero-wind')))
}

/**
 * Reduced motion: cross-fades instead of travel and scaling. The walk still pans,
 * but linearly and locked to the scrollbar, since the points of interest live along it. No wind.
 */
function buildReducedScroll(root: HTMLElement) {
  const { heroOut, walk } = PHASES
  const media = root.querySelector<HTMLElement>(el('hero-media'))!
  const track = root.querySelector<HTMLElement>(el('hero-track'))!
  gsap.set(media, {
    '--clip-t': '0%',
    '--clip-r': '0%',
    '--clip-b': '0%',
    '--clip-l': '0%',
    '--clip-radius': '0px',
  })
  gsap.set(el('walk-progress'), { autoAlpha: 0 })

  scrollTimeline(root, true)
    .to(el('welcome'), { autoAlpha: 0, duration: 0.6 }, 0.6)
    .fromTo([el('hero'), siteHeader()], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.8)
    .to(el('hero-content'), { autoAlpha: 0, duration: len(heroOut) }, heroOut[0])
    .to(track, { x: () => -(track.offsetWidth - media.offsetWidth), ease: 'none', duration: len(walk) }, walk[0])
    .set({}, {}, LENGTH)

  return trackWalk(track, walkSpots(root), null)
}

/** Scrolls to the settled Hero (the site's "home"), not back to the Welcome. */
export function scrollToHome() {
  const root = document.getElementById('inicio')
  if (!root) return
  const top = root.getBoundingClientRect().top + window.scrollY
  const distance = root.offsetHeight - window.innerHeight
  const smooth = window.matchMedia(MEDIA.motion).matches
  window.scrollTo({ top: top + (HOME / LENGTH) * distance, behavior: smooth ? 'smooth' : 'auto' })
}
