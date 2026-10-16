import { welcome } from '../../content/home'
import { site } from '../../content/site'
import './Welcome.css'

export function Welcome() {
  const [top, bottom] = welcome.title

  return (
    <div className="welcome" data-entrance="welcome">
      <div className="welcome__meta" data-entrance="welcome-meta">
        <span className="label" data-intro="fade">
          {welcome.region}
        </span>
      </div>

      <h1 className="welcome__title">
        <span className="welcome__word welcome__word--top" data-entrance="welcome-top">
          <span className="line">
            <span data-intro="line">{top}</span>
          </span>
        </span>
        {/* The place sits on the baseline of the second word, linked to it by a hairline */}
        <span className="welcome__word welcome__word--bottom" data-entrance="welcome-bottom">
          <span className="welcome__place" data-entrance="welcome-place">
            <span className="line">
              <span data-intro="line">{welcome.place}</span>
            </span>
            <span className="welcome__rule" data-intro="fade" aria-hidden="true" />
          </span>
          <span className="line">
            <span data-intro="line">{bottom}</span>
          </span>
        </span>
      </h1>

      <div className="welcome__cue" data-entrance="cue">
        <div className="welcome__cue-inner" data-intro="fade">
          <span className="label">{welcome.cue}</span>
          <span className="welcome__cue-line" aria-hidden="true" />
        </div>
        <img
          className="welcome__owner"
          src={site.owner.logo}
          alt={site.owner.name}
          width="2000"
          height="936"
          data-intro="fade"
        />
      </div>
    </div>
  )
}
