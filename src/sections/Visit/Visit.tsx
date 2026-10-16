import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createVisit } from '../../animation/visit'
import { visit } from '../../content/visit'
import { groupHours, openingStatus } from '../../lib/hours'
import { VisitScene } from './VisitScene'
import './Visit.css'

/** Where the market is: a drawing of the building, opening hours and parking. */
export function Visit() {
  const root = useRef<HTMLElement>(null)
  const [now, setNow] = useState(() => new Date())
  const status = openingStatus(now)
  const today = (now.getDay() + 6) % 7
  const schedule = groupHours()

  useLayoutEffect(() => {
    if (!root.current) return
    return createVisit(root.current)
  }, [])

  // Keep "open now" honest while the page stays open
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section ref={root} id="visitar" className="visit" aria-labelledby="visit-title">
      <div className="visit__sheet" data-visit="sheet" data-header="dark">
        <header className="visit__head">
          <h2 id="visit-title" className="visit__title">
            {visit.title.map((line) => (
              <span className="line" key={line}>
                <span data-visit="title-line">{line}</span>
              </span>
            ))}
          </h2>
          <p className={status.open ? 'visit__status is-open' : 'visit__status'} data-visit="fade">
            <span className="visit__status-dot" aria-hidden="true" />
            {status.text}
          </p>
        </header>

        <div className="visit__layout">
          <figure className="visit__map" data-visit="map">
            <div className="visit__frame">
              <div className="visit__zoom" data-visit="zoom">
                <VisitScene />
              </div>
            </div>
            <figcaption className="visit__map-note label">{visit.sceneNote}</figcaption>
          </figure>

          <div className="visit__panel">
            <div className="visit__row">
              <h3 className="label">Morada</h3>
              <p className="visit__address">
                {visit.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <p className="visit__near">{visit.near}</p>
              <a className="visit__phone" href={`tel:+351${visit.phone.replace(/\s/g, '')}`}>
                {visit.phone}
              </a>
            </div>

            <div className="visit__row">
              <h3 className="label">Horário</h3>
              <ul className="visit__hours">
                {schedule.map((group) => (
                  <li key={group.label} className={group.days.includes(today) ? 'is-today' : undefined}>
                    <span>{group.label}</span>
                    <span>{group.time}</span>
                  </li>
                ))}
              </ul>
              <p className="visit__note">{visit.hoursNote}</p>
            </div>

            <div className="visit__row">
              <h3 className="label">Estacionamento</h3>
              <p className="visit__parking">
                <span className="visit__parking-icon" aria-hidden="true">
                  P
                </span>
                <span>
                  <strong>{visit.parking.title}.</strong> {visit.parking.text}
                </span>
              </p>
            </div>

            <a className="visit__primary" href={visit.mapsUrl} target="_blank" rel="noreferrer">
              Abrir no Google Maps ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
