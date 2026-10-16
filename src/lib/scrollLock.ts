/**
 * Page scroll lock shared by every overlay (menu, producer card, bag).
 * Counted, so closing one overlay while another opens never unlocks too early.
 */
let locks = 0

export function lockScroll(): () => void {
  locks += 1
  document.documentElement.classList.add('is-locked')
  let released = false
  return () => {
    if (released) return
    released = true
    locks = Math.max(0, locks - 1)
    if (locks === 0) document.documentElement.classList.remove('is-locked')
  }
}
