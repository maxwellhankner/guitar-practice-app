import { NavLink, useLocation } from 'react-router-dom'
import { ArrowLeftRight, Guitar, Music2 } from 'lucide-react'

function practiceClass(isActive: boolean, base: string) {
  return isActive ? `${base} ${base}--active` : base
}

/** Temporary gallery of nav styles — pick one, then remove the rest. */
export function AppNav() {
  const { pathname } = useLocation()
  const onTuner = pathname.includes('tuner')
  const swapTo = onTuner ? '/' : '/tuner'
  const swapLabel = onTuner ? 'Practice' : 'Tuner'
  const SwapIcon = onTuner ? Music2 : Guitar

  return (
    <>
      <div className="nav-gallery">
        <p className="nav-gallery__intro">
          Nav style options — tap any to switch pages, then tell me which to keep
        </p>

        {/* A — Segmented switch */}
        <div className="nav-gallery__option">
          <p className="nav-gallery__tag">A · Segmented</p>
          <nav className="nav-seg" aria-label="A Segmented">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                practiceClass(isActive, 'nav-seg__item')
              }
            >
              <Music2 aria-hidden size={15} strokeWidth={2} />
              Practice
            </NavLink>
            <NavLink
              to="/tuner"
              className={({ isActive }) =>
                practiceClass(isActive, 'nav-seg__item')
              }
            >
              <Guitar aria-hidden size={15} strokeWidth={2} />
              Tuner
            </NavLink>
          </nav>
        </div>

        {/* B — Underline tabs */}
        <div className="nav-gallery__option">
          <p className="nav-gallery__tag">B · Underline tabs</p>
          <nav className="nav-tabs" aria-label="B Underline tabs">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                practiceClass(isActive, 'nav-tabs__item')
              }
            >
              Practice
            </NavLink>
            <NavLink
              to="/tuner"
              className={({ isActive }) =>
                practiceClass(isActive, 'nav-tabs__item')
              }
            >
              Tuner
            </NavLink>
          </nav>
        </div>

        {/* C — Icon rail */}
        <div className="nav-gallery__option">
          <p className="nav-gallery__tag">C · Icon rail</p>
          <nav className="nav-icons" aria-label="C Icon rail">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                practiceClass(isActive, 'nav-icons__item')
              }
              aria-label="Practice"
              title="Practice"
            >
              <Music2 aria-hidden size={18} strokeWidth={2} />
            </NavLink>
            <NavLink
              to="/tuner"
              className={({ isActive }) =>
                practiceClass(isActive, 'nav-icons__item')
              }
              aria-label="Tuner"
              title="Tuner"
            >
              <Guitar aria-hidden size={18} strokeWidth={2} />
            </NavLink>
          </nav>
        </div>

        {/* E — Single swap control */}
        <div className="nav-gallery__option">
          <p className="nav-gallery__tag">E · Swap button</p>
          <nav className="nav-swap" aria-label="E Swap">
            <NavLink to={swapTo} className="nav-swap__btn">
              <ArrowLeftRight aria-hidden size={15} strokeWidth={2} />
              <SwapIcon aria-hidden size={15} strokeWidth={2} />
              {swapLabel}
            </NavLink>
          </nav>
        </div>

        <p className="nav-gallery__tag nav-gallery__tag--bottom">
          D · Bottom bar (pinned below)
        </p>
      </div>

      {/* D — Bottom bar */}
      <nav className="nav-bottom" aria-label="D Bottom bar">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            practiceClass(isActive, 'nav-bottom__item')
          }
        >
          <Music2 aria-hidden size={18} strokeWidth={2} />
          Practice
        </NavLink>
        <NavLink
          to="/tuner"
          className={({ isActive }) =>
            practiceClass(isActive, 'nav-bottom__item')
          }
        >
          <Guitar aria-hidden size={18} strokeWidth={2} />
          Tuner
        </NavLink>
      </nav>
    </>
  )
}
