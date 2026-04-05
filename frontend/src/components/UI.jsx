import { chipClass, statusLabel, formatarMoeda, TIPO_LABELS } from '../api.js';

// ─── StatCard ────────────────────────────────────────────────

/**
 * @param {{ label: string, value: string|number, icon: string,
 *           variant?: 'default'|'danger'|'warn'|'success',
 *           valueClass?: string }} props
 */
export function StatCard({ label, value, icon, variant = 'default', valueClass = '' }) {
  return (
    <div className={`stat-card ${variant !== 'default' ? variant : ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${valueClass}`}>{value}</div>
    </div>
  );
}

// ─── TableBadge (chip colorido de status) ────────────────────

/**
 * @param {{ status: number|string }} props
 */
export function TableBadge({ status }) {
  return (
    <span className={`chip ${chipClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

// ─── TipoBadge ───────────────────────────────────────────────

/**
 * @param {{ tipo: number }} props
 */
export function TipoBadge({ tipo }) {
  return (
    <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
      {TIPO_LABELS[tipo] ?? '—'}
    </span>
  );
}

// ─── EmptyState ──────────────────────────────────────────────

/**
 * @param {{ icon?: string, title: string, desc?: string }} props
 */
export function EmptyState({ icon = '📄', title, desc }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {desc && <div className="empty-state-desc">{desc}</div>}
    </div>
  );
}

// ─── Spinner inline ──────────────────────────────────────────

export function Spinner() {
  return <span className="spinner" role="status" aria-label="Carregando" />;
}
