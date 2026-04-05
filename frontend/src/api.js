const BASE = 'http://localhost:5000/api/v1/contratos';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message || body.title || msg;
    } catch (_) {}
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

// ─── Contratos ──────────────────────────────────────────────

/**
 * Lista contratos. Aceita filtro opcional de status.
 * @param {string|null} status - 'Ativo' | 'Encerrado' | 'Suspenso' | 'EmRenovacao'
 */
export function listarContratos(status = null) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`/${qs}`);
}

/**
 * Busca um contrato pelo id.
 * @param {string|number} id
 */
export function buscarContrato(id) {
  return request(`/${id}`);
}

/**
 * Cria um novo contrato.
 * @param {{titulo, fornecedor, cnpjFornecedor, responsavel, descricao, valor, tipo, dataInicio, dataVencimento}} data
 */
export function criarContrato(data) {
  return request('/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Atualiza o status de um contrato.
 * @param {string|number} id
 * @param {0|1|2|3} status - 0=Ativo, 1=Encerrado, 2=Suspenso, 3=EmRenovacao
 */
export function atualizarStatus(id, status) {
  return request(`/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * Registra um aditamento.
 * @param {string|number} id
 * @param {{descricao: string, novoValor?: number, novaDataVencimento?: string}} data
 */
export function adicionarAditamento(id, data) {
  return request(`/${id}/aditamentos`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Remove um contrato.
 * @param {string|number} id
 */
export function deletarContrato(id) {
  return request(`/${id}`, { method: 'DELETE' });
}

/**
 * Retorna contratos vencidos e vencendo em 30 dias.
 * @returns {Promise<{vencidos: Array, vencendoEm30Dias: Array}>}
 */
export function buscarAlertas() {
  return request('/alertas');
}

// ─── Helpers ────────────────────────────────────────────────

export const TIPO_LABELS = [
  'Prestação de Serviços',
  'Fornecimento',
  'Parceria',
  'Locação',
  'Outros',
];

export const STATUS_LABELS = ['Ativo', 'Encerrado', 'Suspenso', 'Em Renovação'];
export const STATUS_KEYS   = ['ativo', 'encerrado', 'suspenso', 'emrenovacao'];

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor ?? 0);
}

export function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function chipClass(status) {
  // status pode vir como número ou string
  const map = {
    0: 'chip-ativo', ativo: 'chip-ativo',
    1: 'chip-encerrado', encerrado: 'chip-encerrado',
    2: 'chip-suspenso', suspenso: 'chip-suspenso',
    3: 'chip-emrenovacao', emrenovacao: 'chip-emrenovacao',
  };
  const key = typeof status === 'string' ? status.toLowerCase().replace(' ', '') : status;
  return map[key] ?? 'chip-encerrado';
}

export function statusLabel(status) {
  if (typeof status === 'number') return STATUS_LABELS[status] ?? '—';
  return status ?? '—';
}
