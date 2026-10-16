import { Hotspot } from '../../components/Hotspot/Hotspot'
import { Photo } from '../../components/Photo'
import { Slider, type Slide } from '../../components/Slider/Slider'
import { hero, news } from '../../content/home'
import './Hero.css'

const FRAMES = 3
const formatDate = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long' }).format

/** Newest news first, dealt across the frames so the three latest open the triptych. */
const newsFrames: Slide[][] = Array.from({ length: FRAMES }, (_, frame) =>
  news.items
    .filter((_, index) => index % FRAMES === frame)
    .map((item) => ({
      image: item.image,
      title: item.title,
      meta: `${item.category} · ${formatDate(new Date(item.date))}`,
      excerpt: item.excerpt,
      href: item.href,
    })),
)

export function Hero() {
  return (
    <section className="hero" data-entrance="hero" aria-labelledby="hero-title">
      <div className="hero__media" data-entrance="hero-media">
        <div className="hero__frame" data-intro="frame">
          {/* The track is the panorama plus everything pinned to it; it pans as one */}
          <div className="hero__track" data-entrance="hero-track" style={{ aspectRatio: hero.imageRatio }}>
            <Photo image={hero.image} fetchPriority="high" />
            <div className="hero__tint" data-entrance="hero-tint" aria-hidden="true" />
            <div className="hero__spots" data-entrance="hero-spots">
              {hero.spots.map((spot, index) => (
                <Hotspot key={spot.label} spot={spot} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <canvas className="hero__wind" data-entrance="hero-wind" aria-hidden="true" />

      <div className="hero__content" data-entrance="hero-content">
        <div className="hero__news" data-entrance="hero-slider">
          <div className="hero__news-head" data-entrance="hero-fade">
            <p className="label">{news.label}</p>
            <a className="label hero__news-all" href={news.href}>
              {news.all} →
            </a>
          </div>
          <Slider frames={newsFrames} label={news.label} cta="Ler notícia" />
        </div>

        <h2 id="hero-title" className="hero__title">
          {hero.title.map((line) => (
            <span className="line" key={line}>
              <span data-entrance="hero-line">{line}</span>
            </span>
          ))}
        </h2>

        <p className="hero__subtitle" data-entrance="hero-fade">
          {hero.subtitle}
        </p>
      </div>

      <div className="hero__shade" data-entrance="hero-shade" aria-hidden="true" />

      <div className="hero__walk" data-entrance="walk-progress" aria-hidden="true">
        <span className="label">{hero.walkHint}</span>
        <span className="hero__progress">
          <span data-entrance="walk-progress-fill" />
        </span>
      </div>
    </section>
  )
}
