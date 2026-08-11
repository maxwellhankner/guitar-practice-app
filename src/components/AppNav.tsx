import { NavLink, useLocation } from 'react-router-dom'
import { ArrowLeftRight, Guitar, Music2 } from 'lucide-react'

export function AppNav() {
  const { pathname } = useLocation()
  const onTuner = pathname.includes('tuner')
  const swapTo = onTuner ? '/' : '/tuner'
  const swapLabel = onTuner ? 'Practice' : 'Tuner'
  const SwapIcon = onTuner ? Music2 : Guitar

  return (
    <nav className="nav-swap" aria-label="App">
      <NavLink to={swapTo} className="nav-swap__btn">
        <ArrowLeftRight aria-hidden size={15} strokeWidth={2} />
        <SwapIcon aria-hidden size={15} strokeWidth={2} />
        {swapLabel}
      </NavLink>
    </nav>
  )
}
