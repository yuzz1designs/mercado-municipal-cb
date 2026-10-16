import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
 * "Vender no mercado".
 *   Blind  — a paper blind rolls up from the bottom to reveal the green.
 *   Title  — word by word, each word tipping up into place.
 *   Steps  — open downwards from their top rule.
 *   Stall  — builds itself: posts rise, counter settles, crates drop in, the awning
 *            unrolls and the "Livre" tag drops down.
 *   Life   — while on screen, the tag swings and the awning moves in the breeze.
 *   Backdrop — bunting drops in and flutters, leaves and gusts cross on the wind.
 * Elements are targeted by data-join="…".
 */

const SCRUB = 1
const MOTION = '(prefers-reduced-motion: no-preference)'

const el = (name: string) => `[data-join="${name}"]`
const all = (root: Element, name: string) => gsap.utils.toArray<HTMLElement>(el(name), root)

export function createJoin(root: HTMLElement): () => void {
  const mm = gsap.matchMedia(root)

  mm.add(MOTION, () => {
    const art = root.querySelector(el('art'))
    gsap.fromTo(
      all(root, 'wash'),
      { scaleY: 1 },
      {
        scaleY: 0,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'top 20%', scrub: SCRUB },
      },
    )

    const words = all(root, 'word')
    const fades = all(root, 'fade')
    const steps = all(root, 'step')
    gsap.set(words, { yPercent: 110, rotation: 6 })
    gsap.set(fades, { autoAlpha: 0, y: 20 })
    gsap.set(steps, { clipPath: 'inset(0% 0% 100% 0%)' })

    gsap
      .timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: root, start: 'top 55%', end: 'top 0%', scrub: SCRUB },
      })
      .to(fades.slice(0, 1), { autoAlpha: 1, y: 0, duration: 0.3 }, 0)
      .to(words, { yPercent: 0, rotation: 0, stagger: 0.1, duration: 0.5 }, 0.05)
      .to(fades.slice(1), { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.4 }, 0.35)
      .to(steps, { clipPath: 'inset(0% 0% 0% 0%)', stagger: 0.1, duration: 0.4 }, 0.45)

    // The stall builds itself
    const part = (name: string) => all(root, name)
    gsap.set(part('posts'), { scaleY: 0, transformOrigin: '50% 100%' })
    gsap.set(part('counter'), { autoAlpha: 0, y: 40 })
    gsap.set(part('crates'), { autoAlpha: 0, y: -50 })
    gsap.set(part('awning'), { scaleY: 0, transformOrigin: '50% 0%' })
    gsap.set(part('tag'), { autoAlpha: 0, y: -40 })

    gsap
      .timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: art, start: 'top 85%', end: 'center 50%', scrub: SCRUB },
      })
      .to(part('posts'), { scaleY: 1, duration: 0.3 }, 0)
      .to(part('counter'), { autoAlpha: 1, y: 0, duration: 0.3 }, 0.15)
      .to(part('awning'), { scaleY: 1, duration: 0.35, ease: 'power2.inOut' }, 0.3)
      .to(part('crates'), { autoAlpha: 1, y: 0, duration: 0.3 }, 0.45)
      .to(part('tag'), { autoAlpha: 1, y: 0, duration: 0.3 }, 0.65)

    // While on screen: the tag swings, the awning breathes in the breeze
    const ambient = [
      gsap.fromTo(
        part('tag'),
        { rotation: -5 },
        { rotation: 5, transformOrigin: '50% 0%', duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true },
      ),
      gsap.fromTo(
        part('awning'),
        { skewX: -1 },
        { skewX: 1, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true },
      ),
    ]
    ScrollTrigger.create({
      trigger: art,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => ambient.forEach((tween) => (self.isActive ? tween.resume() : tween.pause())),
    })

    createBackdrop(root)
  })

  ScrollTrigger.refresh()
  return () => mm.revert()
}

/*
 * Background: the bunting drops in and keeps drifting with the scroll; while on
 * screen the pennants flutter, leaves cross on the wind and gusts sweep by.
 * Runs inside the motion matchMedia, so it is reverted with it.
 */
function createBackdrop(root: HTMLElement) {
  const strings = all(root, 'bunting')
  const pennants = all(root, 'pennant')
  const leaves = all(root, 'leaf')
  const gusts = all(root, 'gust')

  strings.forEach((string, row) => {
    gsap.fromTo(
      string,
      { y: -260 - row * 80 },
      {
        y: 0,
        ease: 'power2.out',
        scrollTrigger: { trigger: root, start: 'top 40%', end: 'top -15%', scrub: SCRUB },
      },
    )
    // Slow parallax as the section scrolls past
    gsap.to(string, {
      y: 60 + row * 40,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: root, start: 'top -15%', end: 'bottom top', scrub: SCRUB },
    })
  })

  const ambient: gsap.core.Animation[] = [
    gsap.fromTo(
      pennants,
      { rotation: -5 },
      {
        rotation: 5,
        transformOrigin: '50% 0%',
        duration: 1.8,
        ease: 'sine.inOut',
        stagger: { each: 0.14, repeat: -1, yoyo: true },
        paused: true,
      },
    ),
  ]

  // Leaves: each crosses left to right at its own height, pace and sway
  leaves.forEach((leaf) => {
    const y = gsap.utils.random(220, 860)
    const duration = gsap.utils.random(16, 28)
    gsap.set(leaf, { x: -40, y, rotation: gsap.utils.random(0, 360), scale: gsap.utils.random(0.7, 1.3) })
    const drift = gsap.timeline({ repeat: -1, paused: true })
    drift
      .to(leaf, { x: 1480, duration, ease: 'none' }, 0)
      .to(leaf, { rotation: `+=${gsap.utils.random(240, 480)}`, duration, ease: 'none' }, 0)
      .to(leaf, { y: y - gsap.utils.random(40, 90), duration: duration / 4, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0)
    drift.progress(Math.random())
    ambient.push(drift)
  })

  // Gusts: a short dash travels along each path, then rests
  gusts.forEach((gust, i) => {
    ambient.push(
      gsap
        .timeline({ repeat: -1, repeatDelay: gsap.utils.random(2, 5), delay: i * 1.6, paused: true })
        .fromTo(gust, { strokeDashoffset: 0.2 }, { strokeDashoffset: -1, duration: 3.2, ease: 'power1.inOut' }),
    )
  })

  ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => ambient.forEach((tween) => (self.isActive ? tween.resume() : tween.pause())),
  })
}
