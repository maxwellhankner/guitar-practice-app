import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="page">
      <div className="welcome-card">
        <h1 className="welcome-card__title">
          Welcome to the guitar practice app
        </h1>
        <p className="welcome-card__subtitle">
          Your space to learn and practice.
        </p>
        <Link to="/guitar" className="welcome-card__action">
          Open guitar diagram
        </Link>
      </div>
    </main>
  )
}
