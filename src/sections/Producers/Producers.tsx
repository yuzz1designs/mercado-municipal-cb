import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { captureList, createProducers, reflowList } from '../../animation/producers'
import { useBag } from '../../bag/BagContext'
import { Photo } from '../../components/Photo'
import { categories, featured, producers, STALLS, type CategoryId, type Producer } from '../../content/producers'
import { ProducerCarousel } from './ProducerCarousel'
import { ProducerDrawer } from './ProducerDrawer'
import './Producers.css'

const pad = (value: number) => String(value).padStart(2, '0')
const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const categoryLabel = (producer: Producer) => categories.find((c) => c.id === producer.category)?.label ?? ''

/** Listed by stall number, the way you walk the market. */
const sorted = [...producers].sort((a, b) => a.stall - b.stall)
const byStall = new Map(producers.map((producer) => [producer.stall, producer]))
const searchText = new Map(
  producers.map((p) => [p.id, normalize([p.name, p.owner, p.origin, categoryLabel(p), ...p.products.map((product) => product.name)].join(' '))]),
)

const featuredProducers = featured.ids
  .map((id) => producers.find((p) => p.id === id))
  .filter((p): p is Producer => Boolean(p))

const stats = [
  { value: producers.length, label: 'negócios no mercado' },
  { value: producers.filter((p) => p.kind === 'produtor').length, label: 'com produção própria' },
  { value: new Set(producers.map((p) => p.origin)).size, label: 'localidades da região' },
]

type Filter = { category: CategoryId | 'all'; query: string; ownOnly: boolean }

export function Producers() {
  const root = useRef<HTMLElement>(null)
  const list = useRef<HTMLOListElement>(null)
  const flipState = useRef<ReturnType<typeof captureList> | null>(null)

  const [filter, setFilter] = useState<Filter>({ category: 'all', query: '', ownOnly: false })
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const bag = useBag()

  const visible = useMemo(() => {
    const query = normalize(filter.query.trim())
    return sorted.filter(
      (p) =>
        (filter.category === 'all' || p.category === filter.category) &&
        (!filter.ownOnly || p.kind === 'produtor') &&
        (!query || searchText.get(p.id)!.includes(query)),
    )
  }, [filter])
  const visibleIds = useMemo(() => new Set(visible.map((p) => p.id)), [visible])

  useLayoutEffect(() => {
    if (!root.current) return
    return createProducers(root.current)
  }, [])

  // Re-flow the list after each filter change
  const updateFilter = (patch: Partial<Filter>) => {
    if (list.current) flipState.current = captureList(list.current)
    setFilter((current) => ({ ...current, ...patch }))
  }
  useLayoutEffect(() => {
    if (flipState.current && list.current) reflowList(flipState.current, list.current)
    flipState.current = null
  }, [visible])

  // Drawer navigation follows the current results (or the whole list for a stall outside them)
  const navigation = selected && visibleIds.has(selected) ? visible : sorted
  const selectedIndex = navigation.findIndex((p) => p.id === selected)
  const current = selectedIndex >= 0 ? navigation[selectedIndex] : null
  const close = useCallback(() => setSelected(null), [])

  const active = hovered ?? selected
  const activeProducer = producers.find((p) => p.id === active)

  return (
    <section ref={root} id="produtores" className="producers" aria-labelledby="producers-title">
      {/* Intro */}
      <div className="producers__intro" data-producers="intro">
        <span className="producers__rule" data-producers="rule" aria-hidden="true" />
        <h2 id="producers-title" className="producers__title">
          <span className="line">
            <span data-producers="title-line">Quem faz</span>
          </span>
          <span className="line">
            <span data-producers="title-line">o mercado.</span>
          </span>
        </h2>
        <p className="producers__lead" data-producers="fade">
          Produtores, artesãos e comerciantes da Beira Baixa. Procure por nome, produto ou localidade, e conheça quem
          está por trás de cada banca.
        </p>
        <dl className="producers__stats">
          {stats.map((stat) => (
            <div key={stat.label} data-producers="fade">
              <dt className="label">{stat.label}</dt>
              <dd data-producers="stat" data-value={stat.value}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Featured producers */}
      <ProducerCarousel
        items={featuredProducers}
        label={featured.label}
        categoryLabel={categoryLabel}
        onOpen={setSelected}
      />

      {/* Directory */}
      <div className="producers__directory">
        <div className="producers__tools" data-producers="fade">
          <label className="producers__search">
            <span className="visually-hidden">Pesquisar negócios</span>
            <input
              type="search"
              placeholder="Pesquisar por nome, produto ou localidade"
              value={filter.query}
              onChange={(event) => updateFilter({ query: event.target.value })}
            />
          </label>

          <div className="producers__chips" role="group" aria-label="Categorias">
            {[{ id: 'all' as const, label: 'Todos' }, ...categories].map((category) => {
              const count =
                category.id === 'all' ? producers.length : producers.filter((p) => p.category === category.id).length
              return (
                <button
                  key={category.id}
                  type="button"
                  className="producers__chip"
                  aria-pressed={filter.category === category.id}
                  onClick={() => updateFilter({ category: category.id })}
                >
                  {category.label}
                  <span>{count}</span>
                </button>
              )
            })}
          </div>

          <label className="producers__toggle">
            <input
              type="checkbox"
              checked={filter.ownOnly}
              onChange={(event) => updateFilter({ ownOnly: event.target.checked })}
            />
            <span className="producers__switch" aria-hidden="true" />
            Só produção própria
          </label>
        </div>

        <div className="producers__layout">
          {/* Stall plan */}
          <aside className="stall-plan" aria-label="Planta das bancas">
            <h3 className="stall-plan__title">
              Planta das <em>bancas</em>
            </h3>
            <div className="stall-plan__floor">
              <span className="stall-plan__entrance label" aria-hidden="true">
                Entrada
              </span>
              <div className="stall-plan__grid">
                {Array.from({ length: STALLS }, (_, index) => {
                  const number = index + 1
                  const producer = byStall.get(number)
                  if (!producer) {
                    return (
                      <span key={number} className="stall is-free" data-producers="stall" aria-hidden="true">
                        {pad(number)}
                      </span>
                    )
                  }
                  const classes = [
                    'stall',
                    visibleIds.has(producer.id) && 'is-match',
                    active === producer.id && 'is-active',
                    bag.countFor(producer.id) > 0 && 'has-bag',
                  ]
                  return (
                    <button
                      key={number}
                      type="button"
                      className={classes.filter(Boolean).join(' ')}
                      data-producers="stall"
                      aria-label={`Banca ${number}: ${producer.name}`}
                      onClick={() => setSelected(producer.id)}
                      onPointerEnter={() => setHovered(producer.id)}
                      onPointerLeave={() => setHovered(null)}
                    >
                      {pad(number)}
                    </button>
                  )
                })}
              </div>
            </div>
            <p className="stall-plan__info" aria-live="polite">
              {activeProducer ? (
                <>
                  <span className="label">Banca {pad(activeProducer.stall)}</span>
                  {activeProducer.name}
                </>
              ) : (
                <span className="label">Passe por uma banca ou um nome</span>
              )}
            </p>
            <ul className="stall-plan__legend label">
              <li className="is-match">Nos resultados</li>
              <li>Outras bancas</li>
              <li className="is-free">Livre</li>
              <li className="has-bag">No saco</li>
            </ul>
          </aside>

          <div className="producers__results">
            <p className="producers__count label" aria-live="polite">
              {visible.length} de {producers.length} negócios
            </p>

            <ol ref={list} className="producers__list" onPointerLeave={() => setHovered(null)}>
              {sorted.map((producer) => (
                <li key={producer.id} data-producers="row" hidden={!visibleIds.has(producer.id)}>
                  <button
                    type="button"
                    className={active === producer.id ? 'producer-row is-active' : 'producer-row'}
                    onClick={() => setSelected(producer.id)}
                    onPointerEnter={() => setHovered(producer.id)}
                    onFocus={() => setHovered(producer.id)}
                    onBlur={() => setHovered(null)}
                  >
                    {/* The producer's photograph fills the row from the right while it is active */}
                    <span className="producer-row__photo" aria-hidden="true">
                      <Photo image={producer.image} loading="lazy" />
                    </span>
                    <span className="producer-row__stall label">
                      Banca {pad(producer.stall)}
                      {bag.countFor(producer.id) > 0 && (
                        <span className="producer-row__bag">No saco · {bag.countFor(producer.id)}</span>
                      )}
                    </span>
                    <span className="producer-row__name">
                      {producer.name}
                      <span className="producer-row__owner">
                        {producer.owner} · {producer.origin}
                      </span>
                    </span>
                    <span className="producer-row__category">{categoryLabel(producer)}</span>
                    <span className="producer-row__arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            {visible.length === 0 && (
              <div className="producers__empty">
                <p>Nenhum negócio corresponde à pesquisa.</p>
                <button type="button" onClick={() => updateFilter({ category: 'all', query: '', ownOnly: false })}>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <ProducerDrawer
        producer={current}
        previous={selectedIndex > 0 ? navigation[selectedIndex - 1] : null}
        next={selectedIndex >= 0 && selectedIndex < navigation.length - 1 ? navigation[selectedIndex + 1] : null}
        categoryLabel={categoryLabel}
        onSelect={setSelected}
        onClose={close}
      />
    </section>
  )
}
