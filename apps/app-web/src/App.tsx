import { Routes, Route, Link } from 'react-router-dom'

import HomePage from './pages/index'
import MandalasPage from './pages/mandalas'
import AtivarPage from './pages/ativar'
import PainelPage from './pages/painel'
import SobrePage from './pages/sobre'
import BoasVindasPage from './pages/boas-vindas'
import DocsPage from './pages/docs'

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mandalas" element={<MandalasPage />} />
        <Route path="/ativar" element={<AtivarPage />} />
        <Route path="/painel" element={<PainelPage />} />
        <Route path="/sobre" element={<SobrePage />} />
        <Route path="/boas-vindas" element={<BoasVindasPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

function NotFound() {
  return (
    <main>
      <h1>404</h1>
      <p>Página não encontrada.</p>
      <p>
        <Link to="/">Voltar para o início</Link>
      </p>
    </main>
  )
}
