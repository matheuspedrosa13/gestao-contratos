import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { buscarAlertas } from './api.js';
import Contratos from './pages/Contratos.jsx';
import NovoContrato from './pages/NovoContrato.jsx';
import Alertas from './pages/Alertas.jsx';

// ─── Header ──────────────────────────────────────────────────

function Header({ alertCount }) {
  return (
    <header className="header">
      <NavLink to="/" className="header-logo">
        LexHub ⚖️
      </NavLink>

      <nav className="header-nav" aria-label="Navegação principal">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
        >
          <span>📄</span>
          <span className="tab-label">Contratos</span>
        </NavLink>

        <NavLink
          to="/novo"
          className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
        >
          <span>＋</span>
          <span className="tab-label">Novo</span>
        </NavLink>

        <NavLink
          to="/alertas"
          className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
        >
          <span>🔔</span>
          <span className="tab-label">Alertas</span>
          {alertCount > 0 && (
            <span className="tab-badge" aria-label={`${alertCount} alertas`}>
              {alertCount > 99 ? '99+' : alertCount}
            </span>
          )}
        </NavLink>
      </nav>
    </header>
  );
}

// ─── App Shell ───────────────────────────────────────────────

function AppShell() {
  const [alertCount, setAlertCount] = useState(0);

  const atualizarAlertas = useCallback(async () => {
    try {
      const data = await buscarAlertas();
      const count =
        (data?.vencidos?.length ?? 0) + (data?.vencendoEm30Dias?.length ?? 0);
      setAlertCount(count);
    } catch (_) {
      // Silencia erro no badge — não é crítico
    }
  }, []);

  useEffect(() => {
    atualizarAlertas();
    const interval = setInterval(atualizarAlertas, 60_000);
    return () => clearInterval(interval);
  }, [atualizarAlertas]);

  return (
    <>
      <Header alertCount={alertCount} />
      <Routes>
        <Route path="/" element={<Contratos />} />
        <Route path="/novo" element={<NovoContrato />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route
          path="*"
          element={
            <main className="page">
              <div className="page-title">Página não encontrada</div>
              <div className="page-subtitle">
                Verifique o endereço ou volte para a{' '}
                <NavLink to="/" style={{ color: 'var(--amber)' }}>
                  lista de contratos
                </NavLink>
                .
              </div>
            </main>
          }
        />
      </Routes>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
