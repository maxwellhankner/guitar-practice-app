import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MobileChinNav } from './components/MobileChinNav'
import { HomePage } from './pages/HomePage'
import { SettingsPage } from './pages/SettingsPage'
import { TunerPage } from './pages/TunerPage'
import { VocalizerPage } from './pages/VocalizerPage'
import './App.css'

/** Matches Vite `base`: `/` in dev, `/guitar-practice-app` on GitHub Pages. */
function routerBasename(): string {
  const base = import.meta.env.BASE_URL
  if (base === '/') {
    return '/'
  }
  return base.endsWith('/') ? base.slice(0, -1) : base
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <div className="app-shell">
        <div className="app-shell__page">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tuner" element={<TunerPage />} />
            <Route path="/vocalizer" element={<VocalizerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <MobileChinNav />
      </div>
    </BrowserRouter>
  )
}
