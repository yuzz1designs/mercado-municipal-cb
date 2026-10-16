import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Dev only: scroll animations bind to DOM nodes once, on mount. A hot update that
 * swaps those nodes leaves GSAP animating detached elements, so script changes to
 * sections, components or animation reload the whole page instead. CSS still hot-swaps.
 */
const reloadMotion = (): Plugin => ({
  name: 'reload-motion',
  hotUpdate({ file }) {
    if (this.environment.name !== 'client') return
    if (!/\/src\/(sections|components|animation)\/.+\.tsx?$/.test(file)) return
    this.environment.hot.send({ type: 'full-reload' })
    return []
  },
})

export default defineConfig({
  plugins: [react(), reloadMotion()],
})
