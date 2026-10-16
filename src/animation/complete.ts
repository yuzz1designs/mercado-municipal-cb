import { gsap } from 'gsap'

/*
 * Order confirmation screen.
 *   In    — a circle opens from the bottom of the screen; the city rises in layers
 *           (far hills slowest), the message is revealed line by line.
 *   Life  — birds cross the sky flapping, faint wind streaks drift past.
 *   Out   — the circle closes again.
 * Elements are targeted by data-complete="…".
 */

const prefersMotion = () => window.matchMedia('(prefers-reduced-motion: no-preference)').matches
const all = (root: Element, name: string) => gsap.utils.toArray<HTMLElement>(`[data-complete="${name}"]`, root)

/** How far each layer of the city travels as it rises (px): further layers move less. */
const DEPTH = { sun: 40, far: 70, castle: 130, town: 190, front: 260 }

export function playComplete(root: HTMLElement) {
  const motion = prefersMotion()
  const ambient: gsap.core.Animation[] = []

  const enter = gsap.timeline({ defaults: { ease: 'expo.out' } })
  if (motion) {
    enter.fromTo(
      root,
      { clipPath: 'circle(0% at 50% 100%)' },
      { clipPath: 'circle(150% at 50% 100%)', duration: 1.5, ease: 'expo.inOut' },
      0,
    )
    for (const [layer, distance] of Object.entries(DEPTH)) {
      enter.fromTo(all(root, `layer-${layer}`), { y: distance }, { y: 0, duration: 2.2 }, 0.35)
    }
    enter
      .fromTo(all(root, 'line'), { yPercent: 110 }, { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.8)
      .fromTo(all(root, 'fade'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 }, 1.2)

    // Birds: each crosses the sky on its own schedule, wings beating
    all(root, 'bird').forEach((bird, index) => {
      const top = gsap.utils.random(8, 38)
      ambient.push(
        gsap.fromTo(
          bird,
          { x: '-12vw', y: `${top}vh` },
          {
            x: '112vw',
            y: `${top + gsap.utils.random(-6, 6)}vh`,
            duration: gsap.utils.random(13, 20),
            ease: 'none',
            repeat: -1,
            delay: 0.9 + index * 1.4,
          },
        ),
        gsap.to(bird.querySelector('[data-complete="wings"]'), {
          scaleY: -0.5,
          duration: gsap.utils.random(0.22, 0.32),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          transformOrigin: '50% 60%',
        }),
      )
    })

    // Wind: dashed streaks sliding across the sky
    all(root, 'wind').forEach((streak) => {
      const length = streak.getAttribute('data-length') ?? '1600'
      ambient.push(
        gsap.fromTo(
          streak,
          { strokeDashoffset: length },
          { strokeDashoffset: -Number(length), duration: gsap.utils.random(5, 9), ease: 'sine.inOut', repeat: -1, delay: gsap.utils.random(0, 3) },
        ),
      )
    })
  } else {
    enter.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
  }

  return {
    /** Closes the screen, then calls done */
    leave(done: () => void) {
      enter.kill()
      const out = motion
        ? gsap.to(root, { clipPath: 'circle(0% at 50% 100%)', duration: 1, ease: 'expo.inOut' })
        : gsap.to(root, { autoAlpha: 0, duration: 0.3 })
      out.eventCallback('onComplete', () => {
        ambient.forEach((animation) => animation.kill())
        done()
      })
    },
    kill() {
      enter.kill()
      ambient.forEach((animation) => animation.kill())
    },
  }
}
