import { NavLink } from 'react-router-dom'
import { Compass, Guitar, Settings } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Explore', icon: Compass, end: true },
  { to: '/tuner', label: 'Tune', icon: Guitar, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const

/** Bottom tab bar for mobile viewports only (shown via CSS). */
export function MobileChinNav() {
  return (
    <nav className="mobile-chin" aria-label="Main">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            [
              'mobile-chin__item',
              isActive ? 'mobile-chin__item--active' : '',
            ]
              .filter(Boolean)
              .join(' ')
          }
        >
          <Icon className="mobile-chin__icon" size={22} strokeWidth={2.25} aria-hidden />
          <span className="mobile-chin__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
