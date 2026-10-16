import { BagProvider } from './bag/BagContext'
import { BagPanel } from './components/Bag/BagPanel'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'
import { Entrance } from './sections/Entrance'
import { Producers } from './sections/Producers/Producers'
import { Products } from './sections/Products/Products'
import { Join } from './sections/Join/Join'
import { Visit } from './sections/Visit/Visit'

export function App() {
  return (
    <BagProvider>
      <Header />
      <main id="top">
        <Entrance />
        <Products />
        <Producers />
        <Visit />
        <Join />
      </main>
      <Footer />
      <BagPanel />
    </BagProvider>
  )
}
