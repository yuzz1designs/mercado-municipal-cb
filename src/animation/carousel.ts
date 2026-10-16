import { gsap } from 'gsap'

/*
 * Featured producers carousel.
 *   Cards — the active card faces the viewer; neighbours turn away in perspective
 *           and recede. Every change glides all cards to their new place.
 *   Pollen — a slow cloud of pale specks around the centre (canvas). It leans
 *           with the pointer and stirs briefly on every change.
 *   Wind   — a few faint streaks: an almost still breeze, and a gust in the
 *           direction of travel on every change that also pushes the specks.
 * Elements are targeted by data-carousel="…".
 */

const MOTION = '(prefers-reduced-motion: no-preference)'

/** Card placement: horizontal spread (fraction of stage width), turn, depth, side scale and opacity. */
const LAYOUT = { spread: 0.4, spreadSmall: 0.62, turn: 34, depth: 320, sideScale: 0.66, sideAlpha: 0.5 }

/** Pollen cloud: particle count, cloud radius (fraction of stage), drift speed. */
const POLLEN = { count: 560, countSmall: 220, rx: 0.36, ry: 0.44, speed: 0.0005 }

/** Wind: streak count, resting breeze opacity, gust opacity and push. */
const WIND = { streaks: 18, streaksSmall: 9, breeze: 0.035, gust: 0.22, push: 2.2 }

const TONES = ['252, 251, 247', '252, 251, 247', '232, 201, 138']

type Speck = {
  angle: number
  radius: number
  size: number
  alpha: number
  depth: number
  tone: string
  spin: number
  /** Horizontal push from the wind, relaxing back to 0 */
  drift: number
}
type Streak = { x: number; y: number; length: number; depth: number }

export function createCarousel(root: HTMLElement) {
  const cards = gsap.utils.toArray<HTMLElement>('[data-carousel="card"]', root)
  const stage = root.querySelector<HTMLElement>('[data-carousel="stage"]')!
  const canvas = root.querySelector<HTMLCanvasElement>('[data-carousel="pollen"]')
  const motion = window.matchMedia(MOTION).matches
  const count = cards.length
  const pollen = canvas ? createPollen(canvas, motion) : null
  let active = 0

  gsap.set(cards, { xPercent: -50, yPercent: -50 })

  const place = (index: number, duration: number) => {
    active = index
    const small = window.matchMedia('(max-width: 767.98px)').matches
    const spread = stage.clientWidth * (small ? LAYOUT.spreadSmall : LAYOUT.spread)

    cards.forEach((card, i) => {
      // Shortest way round, so the ring wraps
      let offset = i - index
      if (offset > count / 2) offset -= count
      if (offset < -count / 2) offset += count
      const distance = Math.abs(offset)

      gsap.to(card, {
        x: offset * spread,
        z: -distance * LAYOUT.depth,
        rotationY: -Math.sign(offset) * Math.min(distance, 1) * LAYOUT.turn,
        scale: distance === 0 ? 1 : LAYOUT.sideScale,
        autoAlpha: distance === 0 ? 1 : distance === 1 ? LAYOUT.sideAlpha : 0,
        zIndex: 10 - distance,
        duration: motion ? duration : 0,
        ease: 'expo.inOut',
        overwrite: 'auto',
      })
    })
  }

  place(0, 0)
  const onResize = () => place(active, 0)
  window.addEventListener('resize', onResize)

  return {
    goTo(index: number) {
      if (index === active) return
      // Direction of travel along the ring (shortest way round)
      let offset = index - active
      if (offset > count / 2) offset -= count
      if (offset < -count / 2) offset += count
      place(index, 1.1)
      pollen?.stir(Math.sign(offset))
    },
    destroy() {
      window.removeEventListener('resize', onResize)
      gsap.killTweensOf(cards)
      pollen?.destroy()
    },
  }
}

/** The active card's caption slides in from below its mask. */
export function revealCaption(target: Element | null) {
  if (!target || !window.matchMedia(MOTION).matches) return
  gsap.fromTo(
    target.querySelectorAll('[data-carousel="caption-line"]'),
    { yPercent: 105 },
    { yPercent: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out' },
  )
}

function createPollen(canvas: HTMLCanvasElement, motion: boolean) {
  const ctx = canvas.getContext('2d')!
  const small = window.matchMedia('(max-width: 767.98px)').matches
  const random = gsap.utils.random
  let width = 0
  let height = 0
  let boost = 0
  let gust = 0
  /** Last direction of travel (1 or -1): the cloud turns and the breeze blows this way */
  let heading = 1
  let visible = false
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

  // Roughly normal distribution, so the cloud is dense at the centre and thins out
  const gaussian = () => (Math.random() + Math.random() + Math.random()) / 3
  const specks: Speck[] = Array.from({ length: small ? POLLEN.countSmall : POLLEN.count }, () => ({
    angle: random(0, Math.PI * 2),
    radius: Math.abs(gaussian() * 2 - 1) * 1.4,
    size: random(0.6, 2.1),
    alpha: random(0.3, 0.95),
    depth: random(0.3, 1),
    tone: TONES[Math.floor(random(0, TONES.length))],
    spin: random(0.6, 1.4),
    drift: 0,
  }))
  const streaks: Streak[] = Array.from({ length: small ? WIND.streaksSmall : WIND.streaks }, () => ({
    x: random(0, 1),
    y: random(0.15, 0.85),
    length: random(80, 240),
    depth: random(0.6, 1.4),
  }))

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    if (!motion) draw(0)
  }

  const draw = (frames: number) => {
    ctx.clearRect(0, 0, width, height)
    boost *= 0.96
    gust *= 0.965
    pointer.x += (pointer.tx - pointer.x) * 0.05
    pointer.y += (pointer.ty - pointer.y) * 0.05
    const cx = width / 2
    const cy = height * 0.46
    // Wind streaks: the air (and the specks) flow the way the cards glide
    const flow = -gust
    const strength = WIND.breeze + Math.abs(gust) * WIND.gust
    ctx.lineCap = 'round'
    ctx.lineWidth = 1
    for (const streak of streaks) {
      const direction = heading
      streak.x += ((0.25 + Math.abs(flow) * 14) * direction * streak.depth * frames) / width
      if (streak.x > 1.15) streak.x = -0.15
      if (streak.x < -0.15) streak.x = 1.15
      const x = streak.x * width
      const y = streak.y * height
      const tail = x - direction * streak.length * (0.5 + Math.abs(gust) * 0.5)
      ctx.strokeStyle = `rgba(252, 251, 247, ${strength * streak.depth})`
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo((x + tail) / 2, y - streak.length * 0.05, tail, y + streak.length * 0.02)
      ctx.stroke()
    }

    for (const speck of specks) {
      // Increasing angle moves the top of the cloud to the right
      speck.angle += (POLLEN.speed + boost) * speck.spin * heading * frames
      speck.drift = (speck.drift + flow * WIND.push * speck.depth * frames) * 0.97
      const x =
        cx + Math.cos(speck.angle) * speck.radius * width * POLLEN.rx + pointer.x * speck.depth * 24 + speck.drift
      const y = cy + Math.sin(speck.angle) * speck.radius * height * POLLEN.ry + pointer.y * speck.depth * 16
      ctx.fillStyle = `rgba(${speck.tone}, ${speck.alpha * (0.4 + speck.depth * 0.6)})`
      ctx.beginPath()
      ctx.arc(x, y, speck.size * speck.depth, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const tick = (_time: number, deltaTime: number) => {
    if (visible) draw(Math.max(deltaTime / (1000 / 60), 0.5))
  }
  const onPointer = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect()
    pointer.tx = (event.clientX - box.left) / box.width - 0.5
    pointer.ty = (event.clientY - box.top) / box.height - 0.5
  }

  // Only animate while the carousel is on screen
  const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
  observer.observe(canvas)
  resize()
  window.addEventListener('resize', resize)
  if (motion) {
    gsap.ticker.add(tick)
    window.addEventListener('pointermove', onPointer)
  }

  return {
    stir: (direction: number) => {
      boost = 0.012
      gust = direction
      heading = -direction
    },
    destroy() {
      observer.disconnect()
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
    },
  }
}
