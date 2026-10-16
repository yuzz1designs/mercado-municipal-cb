import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { createProducts } from '../../animation/products'
import { Photo } from '../../components/Photo'
import { products } from '../../content/home'
import { ProductSketches } from './ProductSketches'
import './Products.css'

const pad = (value: number) => String(value).padStart(2, '0')

export function Products() {
  const root = useRef<HTMLElement>(null)
  const { items } = products

  useLayoutEffect(() => {
    if (!root.current) return
    return createProducts(root.current)
  }, [])

  return (
    <section ref={root} id="produtos" className="products" data-header="dark" aria-labelledby="products-title">
      <div className="products__intro" data-products="intro">
        <ProductSketches />
        <h2 id="products-title" className="products__title">
          {products.title.map((line) => (
            <span className="line" key={line}>
              <span data-products="title-line">{line}</span>
            </span>
          ))}
        </h2>
        <p className="products__lead" data-products="lead">
          {products.intro}
        </p>
      </div>

      {/* Desktop: a sticky stage where products replace each other as you scroll */}
      <div className="products__showcase" data-products="showcase" style={{ '--count': items.length } as CSSProperties}>
        <div className="products__stage">
          <div className="products__counter label" aria-hidden="true">
            <span className="products__counter-window">
              <span className="products__counter-reel" data-products="counter">
                {items.map((item, index) => (
                  <span key={item.name}>{pad(index + 1)}</span>
                ))}
              </span>
            </span>
            <span>/ {pad(items.length)}</span>
          </div>

          <ol className="products__index" aria-hidden="true">
            {items.map((item, index) => (
              <li key={item.name} data-products="index-item">
                <span className="label">{pad(index + 1)}</span>
                {item.name}
              </li>
            ))}
          </ol>

          <div className="products__items">
            {items.map((item) => (
              <article className="product" key={item.name} data-products="item" data-tone={item.tone}>
                <figure className="product__media" data-products="media">
                  <Photo image={item.image} data-products="photo" />
                </figure>
                <div className="product__body" data-products="body">
                  <p className="product__tag label">{item.tag}</p>
                  <h3 className="product__name">{item.name}</h3>
                  <p className="product__text">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
