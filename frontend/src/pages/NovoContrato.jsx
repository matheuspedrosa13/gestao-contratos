import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarContrato, TIPO_LABELS } from '../api.js';
import { Spinner } from '../components/UI.jsx';
import { useToast, Toast } from '../components/Toast.jsx';

const TIPOS_INFO = [
  {
    label: 'Prestação de Serviços',
    icon: '🛠',
    desc: 'Contratação de serviços especializados de terceiros — consultoria, desenvolvimento, manutenção, etc.',
  },
  {
    label: 'Fornecimento',
    icon: '📦',
    desc: 'Aquisição de produtos, insumos ou materiais de fornecedores.',
  },
  {
    label: 'Parceria',
    icon: '🤝',
    desc: 'Acordos de cooperação mútua sem relação de subordinação — joint ventures, alianças comerciais.',
  },
  {
    label: 'Locação',
    icon: '🏢',
    desc: 'Aluguel de imóveis, equipamentos ou veículos com vigência determinada.',
  },
  {
    label: 'Outros',
    icon: '📑',
    desc: 'Demais modalidades contratuais que não se enquadram nas categorias acima.',
  },
];

const INICIAL = {
  titulo: '',
  fornecedor: '',
  cnpjFornecedor: '',
  tipo: '',
  responsavel: '',
  descricao: '',
  valor: '',
  dataInicio: '',
  dataVencimento: '',
};

function validar(form) {
  const e = {};
  if (!form.titulo.trim())        e.titulo = 'Informe o título.';
  if (!form.fornecedor.trim())    e.fornecedor = 'Informe o fornecedor.';
  if (form.tipo === '')           e.tipo = 'Selecione o tipo.';
  if (!form.valor || isNaN(Number(form.valor.replace(',', '.')))) {
    e.valor = 'Informe um valor válido.';
  }
  if (!form.dataInicio)           e.dataInicio = 'Informe a data de início.';
  if (!form.dataVencimento)       e.dataVencimento = 'Informe a data de vencimento.';
  if (form.dataInicio && form.dataVencimento && form.dataVencimento <= form.dataInicio) {
    e.dataVencimento = 'Vencimento deve ser após o início.';
  }
  return e;
}

function formatarCnpj(v) {
  const nums = v.replace(/\D/g, '').slice(0, 14);
  return nums
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export default function NovoContrato() {
  const [form, setForm] = useState(INICIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const { toasts, toast, dismiss } = useToast();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const v = name === 'cnpjFornecedor' ? formatarCnpj(value) : value;
    setForm((prev) => ({ ...prev, [name]: v }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSucesso(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validar(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await criarContrato({
        ...form,
        tipo: Number(form.tipo),
        valor: parseFloat(form.valor.replace(',', '.')),
      });
      setSucesso(true);
      toast({ message: 'Contrato cadastrado com sucesso!', type: 'success' });
      setForm(INICIAL);
      setErrors({});
      // navega para lista após 1.5s
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INICIAL);
    setErrors({});
    setSucesso(false);
  };

  return (
    <main className="page">
      <div className="page-title">Novo Contrato</div>
      <div className="page-subtitle">Preencha os dados para cadastrar um contrato.</div>

      <div className="form-layout">
        {/* ── Formulário ─────────────────────────────── */}
        <div className="form-card form-card-sticky">
          <div className="form-title">Dados do contrato</div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Título */}
            <div className="form-group">
              <label htmlFor="titulo" className="required">Título</label>
              <input
                id="titulo"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ex: Contrato de manutenção predial"
                disabled={loading}
              />
              {errors.titulo && <span className="form-error">{errors.titulo}</span>}
            </div>

            {/* Fornecedor + CNPJ */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fornecedor" className="required">Fornecedor</label>
                <input
                  id="fornecedor"
                  name="fornecedor"
                  value={form.fornecedor}
                  onChange={handleChange}
                  placeholder="Razão social"
                  disabled={loading}
                />
                {errors.fornecedor && <span className="form-error">{errors.fornecedor}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="cnpjFornecedor">CNPJ</label>
                <input
                  id="cnpjFornecedor"
                  name="cnpjFornecedor"
                  value={form.cnpjFornecedor}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Tipo + Responsável */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipo" className="required">Tipo de contrato</label>
                <select
                  className="form-select"
                  id="tipo"
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Selecione…</option>
                  {TIPO_LABELS.map((l, i) => (
                    <option key={i} value={i}>{l}</option>
                  ))}
                </select>
                {errors.tipo && <span className="form-error">{errors.tipo}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="responsavel">Responsável</label>
                <input
                  id="responsavel"
                  name="responsavel"
                  value={form.responsavel}
                  onChange={handleChange}
                  placeholder="Nome do gestor"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Objeto do contrato, escopo, observações…"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Valor */}
            <div className="form-group">
              <label htmlFor="valor" className="required">Valor (R$)</label>
              <input
                id="valor"
                name="valor"
                value={form.valor}
                onChange={handleChange}
                placeholder="Ex: 50000.00"
                inputMode="decimal"
                disabled={loading}
              />
              {errors.valor && <span className="form-error">{errors.valor}</span>}
            </div>

            {/* Datas */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dataInicio" className="required">Data de início</label>
                <input
                  type="date"
                  id="dataInicio"
                  name="dataInicio"
                  value={form.dataInicio}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.dataInicio && <span className="form-error">{errors.dataInicio}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="dataVencimento" className="required">Data de vencimento</label>
                <input
                  type="date"
                  id="dataVencimento"
                  name="dataVencimento"
                  value={form.dataVencimento}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.dataVencimento && (
                  <span className="form-error">{errors.dataVencimento}</span>
                )}
              </div>
            </div>

            {/* Feedback */}
            {sucesso && (
              <div className="feedback-success">
                ✓ Contrato cadastrado! Redirecionando…
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleReset}
                disabled={loading}
              >
                Limpar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <Spinner /> : null}
                {loading ? 'Salvando…' : 'Cadastrar contrato'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Painel de tipos ─────────────────────────── */}
        <div className="info-panel">
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'var(--text-3)',
              marginBottom: 4,
            }}
          >
            Tipos de contrato disponíveis
          </div>
          {TIPOS_INFO.map((t, i) => (
            <div
              key={i}
              className="info-card"
              style={
                form.tipo === String(i)
                  ? { borderColor: 'var(--amber)', background: 'var(--amber-glow2)' }
                  : {}
              }
            >
              <div className="info-card-title">
                <span>{t.icon}</span>
                {t.label}
              </div>
              <div className="info-card-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Toast toasts={toasts} dismiss={dismiss} />
    </main>
  );
}
