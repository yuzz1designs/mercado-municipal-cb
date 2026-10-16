import { gsap } from 'gsap'

/*
 * Auto-playing framed slides. Every few seconds each frame lays its next slide
 * over the current one, in a cascade from left to right (same mask + scale
 * language as the products showcase).
 * While on screen, each image drifts slowly (a gentle zoom and sideways glide).
 * It pauses while hovered or focused (so the info can be read) and while hidden.
 */

/** Seconds each set of slides stays, how long a change takes, and the delay between frames. */
const TIMING = { hold: 4.5, change: 1.4, cascade: 0.18 }

/** Slow drift of the visible image: extra zoom, max travel in % (kept inside the zoom margin), duration. */
const DRIFT = { scale: 1.08, x: 2.5, y: 1.5, duration: 10 }

const MEDIA = { motion: '(prefers-reduced-motion: no-preference)' }

export function createSlider(root: HTMLElement): () => void {
  const frames = gsap.utils.toArray<HTMLElement>('[data-slider="item"]', root).map((item) => ({
    slides: gsap.utils.toArray<HTMLElement>('[data-slider="slide"]', item),
    photos: gsap.utils.toArray<HTMLElement>('[data-slider="photo"]', item),
    captions: gsap.utils.toArray<HTMLElement>('[data-slider="caption"]', item),
    current: 0,
  }))

  const mm = gsap.matchMedia()
  mm.add(MEDIA, (context) => {
    const { motion } = context.conditions as Record<keyof typeof MEDIA, boolean>
    let hovered = false
    let focused = false
    for (const frame of frames) {
      frame.current = 0
      gsap.set(frame.slides, { autoAlpha: 0, zIndex: 0 })
      gsap.set(frame.slides[0], { autoAlpha: 1, zIndex: 1 })
      gsap.set(frame.captions, { autoAlpha: 0 })
      gsap.set(frame.captions[0] ?? [], { autoAlpha: 1 })
    }

    const onEnter = () => (hovered = true)
    const onLeave = () => (hovered = false)
    const onFocusIn = () => (focused = true)
    const onFocusOut = (event: FocusEvent) => (focused = root.contains(event.relatedTarget as Node | null))
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)

    /** Gentle zoom + glide in a random direction; overwrite leaves room for the next change. */
    const drift = (photo: HTMLElement) =>
      gsap.to(photo, {
        scale: DRIFT.scale,
        xPercent: gsap.utils.random(-DRIFT.x, DRIFT.x),
        yPercent: gsap.utils.random(-DRIFT.y, DRIFT.y),
        duration: DRIFT.duration,
        ease: 'sine.inOut',
        overwrite: 'auto',
      })

    if (motion) frames.forEach(({ photos }) => photos[0] && drift(photos[0]))

    // Hidden by the page (e.g. the Hero copy has scrolled away)?
    const visible = () => getComputedStyle(root).visibility !== 'hidden' && !document.hidden

    const change = (frame: (typeof frames)[number], delay: number) => {
      const { slides, photos, captions } = frame
      if (slides.length < 2) return
      const previous = frame.current
      const current = (previous + 1) % slides.length
      frame.current = current

      const tl = gsap.timeline({
        delay,
        onStart: () => {
          gsap.set(slides[previous], { zIndex: 1 })
          // Start fully masked (or transparent) so the new slide never flashes in
          gsap.set(slides[current], motion ? { autoAlpha: 1, zIndex: 2, clipPath: 'inset(100% 0% 0% 0%)' } : { zIndex: 2 })
          // Clear the last drift while still masked
          if (motion) gsap.set(photos[current], { xPercent: 0, yPercent: 0 })
        },
        onComplete: () => gsap.set(slides[previous], { autoAlpha: 0, zIndex: 0 }),
      })

      // The caption under the frame follows the image
      if (captions.length) {
        tl.to(captions[previous], { autoAlpha: 0, y: motion ? -8 : 0, duration: 0.5, ease: 'power2.in' }, 0).fromTo(
          captions[current],
          { autoAlpha: 0, y: motion ? 10 : 0 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out', immediateRender: false },
          0.55,
        )
      }

      if (motion) {
        tl.fromTo(
          slides[current],
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: TIMING.change, ease: 'expo.inOut', immediateRender: false },
          0,
        )
          .fromTo(
            photos[current],
            { scale: 1.25 },
            { scale: 1, duration: TIMING.change * 1.3, ease: 'expo.out', immediateRender: false },
            0,
          )
          .to(photos[previous], { scale: '+=0.06', duration: TIMING.change, ease: 'power2.inOut', overwrite: 'auto' }, 0)
          // Once settled, the new image starts drifting
          .call(() => drift(photos[current]), [], TIMING.change * 1.3)
      } else {
        tl.fromTo(slides[current], { autoAlpha: 0 }, { autoAlpha: 1, duration: TIMING.change, immediateRender: false }, 0)
      }
    }

    // Changes are created later, from the timer, so they are cleaned up by hand below
    let timer = gsap.delayedCall(TIMING.hold, function tick() {
      if (!hovered && !focused && visible()) frames.forEach((frame, index) => change(frame, index * TIMING.cascade))
      timer = gsap.delayedCall(TIMING.hold, tick)
    })

    return () => {
      timer.kill()
      for (const { slides, photos, captions } of frames) {
        gsap.killTweensOf([...slides, ...photos, ...captions])
        gsap.set(slides, { clearProps: 'clipPath,zIndex,opacity,visibility' })
        gsap.set(photos, { clearProps: 'transform' })
        gsap.set(captions, { clearProps: 'opacity,visibility,transform' })
      }
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
    }
  })

  return () => mm.revert()
}
