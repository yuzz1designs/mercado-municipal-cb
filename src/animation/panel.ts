import { gsap } from 'gsap'

/*
 * Side panels (producer card, shopping bag): the backdrop fades in and the panel
 * opens from the right with the site's mask; its content rises in.
 * Elements are targeted by data-panel="backdrop" | "body" | "photo" | "item".
 */

const prefersMotion = () => window.matchMedia('(prefers-reduced-motion: no-preference)').matches
const part = (root: Element, name: string) => root.querySelectorAll<HTMLElement>(`[data-panel="${name}"]`)

/** Open / close controls. Visibility is switched outside the timeline so focus can move in at once. */
export function createPanel(root: HTMLElement) {
  const body = root.querySelector('[data-panel="body"]')
  const hide = () => gsap.set(root, { visibility: 'hidden' })
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' }, onReverseComplete: hide })
  tl.fromTo(part(root, 'backdrop'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0)

  if (prefersMotion()) {
    tl.fromTo(body, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9 }, 0)
  } else {
    tl.fromTo(body, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0)
  }

  return {
    open() {
      gsap.set(root, { visibility: 'visible' })
      tl.timeScale(1).play()
    },
    close() {
      if (tl.progress() > 0) tl.timeScale(1.4).reverse()
      else hide()
    },
    kill: () => tl.kill(),
  }
}

/** Content entrance inside an open panel (first open, or when its content changes). */
export function revealPanelContent(root: HTMLElement, delay = 0) {
  if (!prefersMotion()) return
  gsap.fromTo(part(root, 'photo'), { scale: 1.2 }, { scale: 1, duration: 1.4, delay, ease: 'expo.out', overwrite: true })
  gsap.fromTo(
    part(root, 'item'),
    { autoAlpha: 0, y: 24 },
    { autoAlpha: 1, y: 0, duration: 0.8, delay: delay + 0.1, stagger: 0.05, ease: 'expo.out', overwrite: true },
  )
}

/** Small "pop" when a count changes (e.g. the bag button). */
export function pulse(target: Element | null) {
  if (!target || !prefersMotion()) return
  gsap.fromTo(target, { scale: 1.18 }, { scale: 1, duration: 0.8, ease: 'expo.out', overwrite: true })
}
