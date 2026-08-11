import { NavLink } from 'react-router-dom'

export function AppNav() {
  return (
    <nav className="nav-toggle" aria-label="App">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? 'nav-toggle__item nav-toggle__item--active' : 'nav-toggle__item'
        }
      >
        Practice
      </NavLink>
      <NavLink
        to="/tuner"
        className={({ isActive }) =>
          isActive ? 'nav-toggle__item nav-toggle__item--active' : 'nav-toggle__item'
        }
      >
        Tuner
      </NavLink>
    </nav>
  )
}
