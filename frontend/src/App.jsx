import { Suspense, lazy, useState } from 'react'

const Hangar = lazy(() => import('./pages/Hangar'))
const Battle = lazy(() => import('./pages/Battle'))

function App() {
  const [page, setPage] = useState('hangar')
  const [jugador, setJugador] = useState(null)

  return (
      <div>
        <nav className="navbar navbar-dark bg-dark px-4">
          <span className="navbar-brand">🔒 IRON GATE</span>
          <div>
            <button
                className="btn btn-outline-light me-2"
                onClick={() => setPage('hangar')}
            >
              Hangar
            </button>
            <button
                className="btn btn-danger"
                onClick={() => setPage('battle')}
                disabled={!jugador}
            >
              Batallar
            </button>
          </div>
        </nav>

        <Suspense fallback={<p className="text-center text-light mt-4">Carregant...</p>}>
          {page === 'hangar' ? (
              <Hangar jugador={jugador} setJugador={setJugador} />
          ) : (
              <Battle jugador={jugador} />
          )}
        </Suspense>
      </div>
  )
}

export default App