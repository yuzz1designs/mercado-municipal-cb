import { gsap } from 'gsap'

/*
 * Effects that follow the panorama while it pans:
 *  - points of interest reveal themselves as they approach the centre of the screen;
 *  - wind (streaks and a few olive leaves) blows at the speed the scene is moving.
 * Both read the track's actual position every frame, so they follow the scrub
 * smoothing and reverse naturally when scrolling back.
 */

/** Distance from the centre (0 = centre, 1 = screen edge) where a card is fully shown / gone. */
const SPOT_REVEAL = { full: 0.18, none: 0.55 }

type Streak = { x: number; y: number; length: number; depth: number; alpha: number }
type Leaf = { x: number; y: number; size: number; angle: number; spin: number; depth: number; phase: number }

const LEAF_TONES = ['#a3ad84', '#8a9a6a', '#c4c9a8']

export function trackWalk(track: HTMLElement, spots: HTMLElement[], canvas: HTMLCanvasElement | null) {
  const wind = canvas ? createWind(canvas) : null
  let lastX = gsap.getProperty(track, 'x') as number
  let speed = 0

  const tick = (_time: number, deltaTime: number) => {
    const x = gsap.getProperty(track, 'x') as number
    // px per 60fps frame, smoothed so gusts build and settle gently
    const frames = Math.max(deltaTime / (1000 / 60), 0.5)
    speed += ((x - lastX) / frames - speed) * 0.12
    lastX = x

    const centre = window.innerWidth / 2
    for (const spot of spots) {
      const box = spot.getBoundingClientRect()
      const distance = Math.abs(box.left - centre) / centre
      const reveal = gsap.utils.clamp(0, 1, (SPOT_REVEAL.none - distance) / (SPOT_REVEAL.none - SPOT_REVEAL.full))
      spot.style.setProperty('--reveal', reveal.toFixed(3))
    }

    wind?.draw(speed, frames)
  }

  gsap.ticker.add(tick)
  return () => {
    gsap.ticker.remove(tick)
    wind?.destroy()
  }
}

function createWind(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  const small = window.matchMedia('(max-width: 767.98px)').matches
  let width = 0
  let height = 0
  let time = 0
  let visible = false

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)

  const random = gsap.utils.random
  const streaks: Streak[] = Array.from({ length: small ? 14 : 28 }, () => ({
    x: random(0, width),
    y: random(height * 0.08, height * 0.92),
    length: random(80, 260),
    depth: random(1.15, 2),
    alpha: random(0.12, 0.38),
  }))
  const leaves: Leaf[] = Array.from({ length: small ? 5 : 10 }, () => ({
    x: random(0, width),
    y: random(height * 0.15, height * 0.85),
    size: random(7, 13),
    angle: random(0, Math.PI * 2),
    spin: random(-1, 1),
    depth: random(1.3, 2.2),
    phase: random(0, Math.PI * 2),
  }))

  /** Keeps particles cycling across the screen in either direction. */
  const wrap = (item: { x: number; y: number }, margin: number, direction: number) => {
    if (direction < 0 && item.x < -margin) {
      item.x = width + random(0, margin)
      item.y = random(height * 0.08, height * 0.92)
    } else if (direction > 0 && item.x > width + margin) {
      item.x = -random(0, margin)
      item.y = random(height * 0.08, height * 0.92)
    }
  }

  const draw = (speed: number, frames: number) => {
    const intensity = Math.min(Math.abs(speed) / 9, 1)
    if (intensity < 0.01) {
      if (visible) ctx.clearRect(0, 0, width, height)
      visible = false
      return
    }
    visible = true
    time += frames / 60
    const direction = Math.sign(speed)
    ctx.clearRect(0, 0, width, height)

    // Streaks: soft curved lines, stretched by the gust
    ctx.lineCap = 'round'
    ctx.lineWidth = 1
    for (const streak of streaks) {
      streak.x += speed * streak.depth * frames
      wrap(streak, streak.length, direction)
      const length = streak.length * (0.35 + intensity * 0.65)
      const tail = streak.x - direction * length
      ctx.strokeStyle = `rgba(252, 251, 247, ${streak.alpha * intensity})`
      ctx.beginPath()
      ctx.moveTo(streak.x, streak.y)
      ctx.quadraticCurveTo((streak.x + tail) / 2, streak.y - length * 0.05, tail, streak.y + length * 0.015)
      ctx.stroke()
    }

    // Olive leaves tumbling along
    for (const [index, leaf] of leaves.entries()) {
      leaf.x += speed * leaf.depth * frames
      leaf.y += Math.sin(time * 1.6 + leaf.phase) * 0.6 * intensity * frames
      leaf.angle += leaf.spin * speed * 0.012 * frames
      wrap(leaf, 40, direction)
      ctx.save()
      ctx.translate(leaf.x, leaf.y)
      ctx.rotate(leaf.angle)
      ctx.globalAlpha = 0.85 * intensity
      ctx.fillStyle = LEAF_TONES[index % LEAF_TONES.length]
      ctx.beginPath()
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.32, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  return {
    draw,
    destroy() {
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, width, height)
    },
  }
}
