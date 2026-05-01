import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { GuitarDiagramPage } from './pages/GuitarDiagramPage'
import { HomePage } from './pages/HomePage'
import './App.css'

function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-nav" aria-label="Main">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link${isActive ? ' nav-link--active' : ''}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/guitar"
            className={({ isActive }) =>
              `nav-link${isActive ? ' nav-link--active' : ''}`
            }
          >
            Guitar diagram
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/guitar" element={<GuitarDiagramPage />} />
      </Route>
    </Routes>
  )
}
