import { NavLink } from 'react-router-dom'
import { Guitar, Music2 } from 'lucide-react'

export function AppNav() {
  return (
    <nav className="app-nav" aria-label="App">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
        }
      >
        <Music2 aria-hidden size={16} strokeWidth={2} />
        Practice
      </NavLink>
      <NavLink
        to="/tuner"
        className={({ isActive }) =>
          isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
        }
      >
        <Guitar aria-hidden size={16} strokeWidth={2} />
        Tuner
      </NavLink>
    </nav>
  )
}
