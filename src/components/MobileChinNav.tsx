import { NavLink } from 'react-router-dom'
import { BookOpen, Guitar, Mic, Settings } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Learn', icon: BookOpen, end: true },
  { to: '/vocalizer', label: 'Hum', icon: Mic, end: false },
  { to: '/tuner', label: 'Tune', icon: Guitar, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const

/** Main menu: Learn, Hum, Tune, Settings. */
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
