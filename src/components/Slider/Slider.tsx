import { useLayoutEffect, useRef, type HTMLAttributes } from 'react'
import { createSlider } from '../../animation/slider'
import type { PhotoAsset } from '../../content/home'
import { Photo } from '../Photo'
import './Slider.css'

export type Slide = {
  image: PhotoAsset
  /** Caption under the frame, always visible */
  title?: string
  meta?: string
  /** Revealed over the image on hover / focus */
  excerpt?: string
  href?: string
}

type SliderProps = HTMLAttributes<HTMLDivElement> & {
  /** One list of slides per frame; each frame cycles through its own list. */
  frames: Slide[][]
  label: string
  /** Call to action shown with the excerpt */
  cta?: string
}

/** Auto-playing set of framed slides with captions. Timing lives in animation/slider.ts. */
export function Slider({ frames, label, cta = 'Ler', className, ...rest }: SliderProps) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!root.current) return
    return createSlider(root.current)
  }, [])

  return (
    <div
      {...rest}
      ref={root}
      className={className ? `slider ${className}` : 'slider'}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
    >
      {frames.map((slides, index) => (
        <div className="slider__item" data-slider="item" key={index}>
          <div className="slider__frame" data-slider="frame">
            {slides.map((slide) => {
              const content = (
                <>
                  <Photo image={slide.image} data-slider="photo" />
                  {slide.excerpt && (
                    <span className="slider__info">
                      <span className="slider__excerpt">{slide.excerpt}</span>
                      {slide.href && <span className="slider__cta label">{cta} →</span>}
                    </span>
                  )}
                </>
              )
              return slide.href ? (
                <a
                  className="slider__slide"
                  data-slider="slide"
                  href={slide.href}
                  aria-label={slide.title}
                  key={slide.image.src}
                >
                  {content}
                </a>
              ) : (
                <div className="slider__slide" data-slider="slide" key={slide.image.src}>
                  {content}
                </div>
              )
            })}
          </div>

          {slides.some((slide) => slide.title) && (
            <div className="slider__captions" data-slider="captions" aria-hidden="true">
              {slides.map((slide) => (
                <p className="slider__caption" data-slider="caption" key={slide.image.src}>
                  {slide.meta && <span className="slider__meta label">{slide.meta}</span>}
                  <span className="slider__title">{slide.title}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
