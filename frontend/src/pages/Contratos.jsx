import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  listarContratos,
  atualizarStatus,
  buscarAlertas,
  formatarMoeda,
  formatarData,
  TIPO_LABELS,
} from '../api.js';
import { StatCard, TableBadge, TipoBadge, EmptyState, Spinner } from '../components/UI.jsx';
import { Modal } from '../components/Modal.jsx';
import { useToast, Toast } from '../components/Toast.jsx';

const FILTROS = [
  { value: '', label: 'Todos os status' },
  { value: 'Ativo', label: 'Ativos' },
  { value: 'Encerrado', label: 'Encerrados' },
  { value: 'Suspenso', label: 'Suspensos' },
  { value: 'EmRenovacao', label: 'Em Renovação' },
];

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [alertas, setAlertas] = useState({ vencidos: [], vencendoEm30Dias: [] });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [aditamentoId, setAditamentoId] = useState(null);
  const { toasts, toast, dismiss } = useToast();

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [lista, al] = await Promise.all([
        listarContratos(filtro || null),
        buscarAlertas(),
      ]);
      setContratos(lista ?? []);
      setAlertas(al ?? { vencidos: [], vencendoEm30Dias: [] });
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filtro]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Stats derivados do estado atual
  const stats = useMemo(() => {
    const total = contratos.length;
    const valorTotal = contratos.reduce((s, c) => s + (c.valor ?? 0), 0);
    const vencidos = contratos.filter((c) => c.estaVencido).length;
    const soon = contratos.filter((c) => c.venceEm30Dias && !c.estaVencido).length;
    return { total, valorTotal, vencidos, soon };
  }, [contratos]);

  const handleEncerrar = useCallback(
    async (id) => {
      if (!confirm('Encerrar este contrato?')) return;
      try {
        await atualizarStatus(id, 1); // 1 = Encerrado
        toast({ message: 'Contrato encerrado.', type: 'success' });
        carregar();
      } catch (err) {
        toast({ message: err.message, type: 'error' });
      }
    },
    [carregar, toast]
  );

  const alertaCount = alertas.vencidos.length + alertas.vencendoEm30Dias.length;

  return (
    <main className="page">
      <div className="page-title">Contratos</div>
      <div className="page-subtitle">Gerencie todos os contratos da organização.</div>

      {/* Alert banner */}
      {alertas.vencidos.length > 0 && (
        <div className="alert-banner">
          <span>⚠</span>
          <span>
            <strong>{alertas.vencidos.length}</strong>{' '}
            {alertas.vencidos.length === 1 ? 'contrato vencido' : 'contratos vencidos'}.{' '}
            Revise e tome uma ação.
          </span>
        </div>
      )}
      {alertas.vencendoEm30Dias.length > 0 && (
        <div className="alert-banner warn">
          <span>🕐</span>
          <span>
            <strong>{alertas.vencendoEm30Dias.length}</strong>{' '}
            {alertas.vencendoEm30Dias.length === 1
              ? 'contrato vence'
              : 'contratos vencem'}{' '}
            nos próximos 30 dias.
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total de contratos"
          value={stats.total}
          icon="📄"
          valueClass="amber"
        />
        <StatCard
          label="Valor total"
          value={formatarMoeda(stats.valorTotal)}
          icon="💰"
          valueClass="green"
          variant="success"
        />
        <StatCard
          label="Vencidos"
          value={stats.vencidos}
          icon="❌"
          valueClass={stats.vencidos > 0 ? 'red' : ''}
          variant={stats.vencidos > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Vencem em 30 dias"
          value={stats.soon}
          icon="⏳"
          valueClass={stats.soon > 0 ? 'yellow' : ''}
          variant={stats.soon > 0 ? 'warn' : 'default'}
        />
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <span className="toolbar-title">
          {filtro ? `Filtrando: ${FILTROS.find((f) => f.value === filtro)?.label}` : 'Todos os contratos'}
          {!loading && (
            <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: 8 }}>
              ({contratos.length})
            </span>
          )}
        </span>
        <select
          className="select"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          aria-label="Filtrar por status"
        >
          {FILTROS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={carregar} title="Atualizar">
          ↻ Atualizar
        </button>
      </div>

      {/* Tabela */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Contrato / Fornecedor</th>
              <th className="col-tipo">Tipo</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan={6}>
                  <Spinner />
                </td>
              </tr>
            ) : contratos.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon="📋"
                    title="Nenhum contrato encontrado"
                    desc={
                      filtro
                        ? 'Tente outro filtro ou remova o filtro atual.'
                        : 'Clique em "Novo" para cadastrar o primeiro contrato.'
                    }
                  />
                </td>
              </tr>
            ) : (
              contratos.map((c) => (
                <tr key={c.id}>
                  {/* Contrato + fornecedor */}
                  <td>
                    <div className="td-primary">{c.titulo}</div>
                    <div className="td-secondary">{c.fornecedor}</div>
                    {c.responsavel && (
                      <div className="td-secondary" style={{ color: 'var(--text-3)' }}>
                        resp.: {c.responsavel}
                      </div>
                    )}
                  </td>

                  {/* Tipo */}
                  <td className="col-tipo">
                    <TipoBadge tipo={c.tipo} />
                  </td>

                  {/* Valor */}
                  <td className="td-valor">{formatarMoeda(c.valor)}</td>

                  {/* Vencimento */}
                  <td>
                    <span
                      className={`td-date ${
                        c.estaVencido ? 'expired' : c.venceEm30Dias ? 'soon' : ''
                      }`}
                    >
                      {formatarData(c.dataVencimento)}
                      {c.estaVencido && (
                        <span style={{ marginLeft: 4, fontSize: '0.7rem' }}>VENCIDO</span>
                      )}
                      {!c.estaVencido && c.venceEm30Dias && (
                        <span style={{ marginLeft: 4, fontSize: '0.7rem' }}>EM BREVE</span>
                      )}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <TableBadge status={c.status} />
                  </td>

                  {/* Ações */}
                  <td>
                    <div className="td-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setAditamentoId(c.id)}
                        title="Registrar aditamento"
                      >
                        📋 Aditar
                      </button>
                      {c.status !== 1 && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleEncerrar(c.id)}
                          title="Encerrar contrato"
                        >
                          Encerrar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal aditamento */}
      <Modal
        contratoId={aditamentoId}
        onClose={() => setAditamentoId(null)}
        onSuccess={(msg) => {
          toast({ message: msg, type: 'success' });
          carregar();
        }}
        onError={(msg) => toast({ message: msg, type: 'error' })}
      />

      <Toast toasts={toasts} dismiss={dismiss} />
    </main>
  );
}
