import { useState, useEffect } from 'react';
import { buscarAlertas, formatarMoeda, formatarData } from '../api.js';
import { EmptyState, Spinner } from '../components/UI.jsx';

function AlertaCard({ contrato, variant }) {
  return (
    <div className={`alerta-card ${variant}`}>
      <div className="alerta-card-title">{contrato.titulo}</div>
      <div className="alerta-card-meta">
        <span>🏢 {contrato.fornecedor}</span>
        <span>💰 {formatarMoeda(contrato.valor)}</span>
        <span
          className={`alerta-card-date ${variant === 'expired' ? 'red' : 'yellow'}`}
        >
          📅 {formatarData(contrato.dataVencimento)}
        </span>
      </div>
    </div>
  );
}

export default function Alertas() {
  const [alertas, setAlertas] = useState({ vencidos: [], vencendoEm30Dias: [] });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const data = await buscarAlertas();
        if (!cancelled) {
          setAlertas(data ?? { vencidos: [], vencendoEm30Dias: [] });
        }
      } catch (err) {
        if (!cancelled) setErro(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    carregar();
    // Atualiza a cada 60 segundos
    const interval = setInterval(carregar, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const totalAlertas = alertas.vencidos.length + alertas.vencendoEm30Dias.length;

  return (
    <main className="page">
      <div className="page-title">Alertas</div>
      <div className="page-subtitle">
        Contratos que requerem atenção imediata.
        {!loading && totalAlertas === 0 && (
          <span style={{ color: 'var(--green)', marginLeft: 8 }}>
            ✓ Tudo em dia.
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner />
        </div>
      ) : erro ? (
        <div className="feedback-error" style={{ marginTop: 0 }}>
          ✕ Erro ao carregar alertas: {erro}
        </div>
      ) : (
        <div className="alertas-grid">
          {/* ── Vencidos ──────────────────────────────── */}
          <div>
            <div className="alertas-section-title red">
              <span>❌</span>
              Vencidos ({alertas.vencidos.length})
            </div>

            {alertas.vencidos.length === 0 ? (
              <div className="alerta-card" style={{ borderLeft: 'none', opacity: 0.7 }}>
                <EmptyState
                  icon="✅"
                  title="Nenhum contrato vencido"
                  desc="Todos os contratos estão dentro da vigência."
                />
              </div>
            ) : (
              alertas.vencidos.map((c) => (
                <AlertaCard key={c.id} contrato={c} variant="expired" />
              ))
            )}
          </div>

          {/* ── Vencendo em 30 dias ───────────────────── */}
          <div>
            <div className="alertas-section-title amber">
              <span>⏳</span>
              Vencendo em 30 dias ({alertas.vencendoEm30Dias.length})
            </div>

            {alertas.vencendoEm30Dias.length === 0 ? (
              <div className="alerta-card" style={{ borderLeft: 'none', opacity: 0.7 }}>
                <EmptyState
                  icon="✅"
                  title="Nenhum contrato vencendo em breve"
                  desc="Não há contratos com vencimento nos próximos 30 dias."
                />
              </div>
            ) : (
              alertas.vencendoEm30Dias.map((c) => (
                <AlertaCard key={c.id} contrato={c} variant="soon" />
              ))
            )}
          </div>
        </div>
      )}
    </main>
  );
}
