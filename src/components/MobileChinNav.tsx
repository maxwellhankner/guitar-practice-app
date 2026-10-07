import { NavLink } from 'react-router-dom'
import { BookOpen, Mic, Settings } from 'lucide-react'
import { StratHeadstockIcon } from './StratHeadstockIcon'

const ITEMS = [
  { to: '/tune', label: 'Tune', icon: StratHeadstockIcon, end: false },
  { to: '/learn', label: 'Learn', icon: BookOpen, end: false },
  { to: '/jam', label: 'Jam', icon: Mic, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const

/** Main menu: Tune, Learn, Jam, Settings. */
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
