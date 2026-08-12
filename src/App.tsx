import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MobileChinNav } from './components/MobileChinNav'
import { HomePage } from './pages/HomePage'
import { SettingsPage } from './pages/SettingsPage'
import { TunerPage } from './pages/TunerPage'
import './App.css'

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <div className="app-shell__page">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tuner" element={<TunerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <MobileChinNav />
      </div>
    </HashRouter>
  )
}
