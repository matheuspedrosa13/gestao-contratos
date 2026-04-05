import { useState, useEffect, useCallback } from 'react';
import { adicionarAditamento } from '../api.js';
import { Spinner } from './UI.jsx';

const INITIAL = { descricao: '', novoValor: '', novaDataVencimento: '' };

/**
 * Modal de aditamento de contrato.
 *
 * @param {{ contratoId: string|number|null, onClose: () => void,
 *           onSuccess: (msg: string) => void, onError: (msg: string) => void }} props
 */
export function Modal({ contratoId, onClose, onSuccess, onError }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fecha com ESC
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Reset ao abrir
  useEffect(() => {
    if (contratoId) {
      setForm(INITIAL);
      setErrors({});
    }
  }, [contratoId]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.descricao.trim()) errs.descricao = 'Descrição é obrigatória.';
    if (form.novoValor && isNaN(Number(form.novoValor.replace(',', '.')))) {
      errs.novoValor = 'Valor inválido.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = { descricao: form.descricao.trim() };
    if (form.novoValor) {
      payload.novoValor = parseFloat(form.novoValor.replace(',', '.'));
    }
    if (form.novaDataVencimento) {
      payload.novaDataVencimento = form.novaDataVencimento;
    }

    setLoading(true);
    try {
      await adicionarAditamento(contratoId, payload);
      onSuccess('Aditamento registrado com sucesso.');
      onClose();
    } catch (err) {
      onError(err.message ?? 'Erro ao registrar aditamento.');
    } finally {
      setLoading(false);
    }
  };

  if (!contratoId) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            📋 Registrar Aditamento
          </h2>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Fechar"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Descrição */}
          <div className="form-group">
            <label htmlFor="descricao" className="required">
              Descrição do aditamento
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Descreva as alterações realizadas…"
              rows={3}
              disabled={loading}
            />
            {errors.descricao && (
              <span className="form-error">{errors.descricao}</span>
            )}
          </div>

          {/* Novo valor (opcional) */}
          <div className="form-group">
            <label htmlFor="novoValor">Novo valor (opcional)</label>
            <input
              type="text"
              id="novoValor"
              name="novoValor"
              value={form.novoValor}
              onChange={handleChange}
              placeholder="Ex: 150000.00"
              inputMode="decimal"
              disabled={loading}
            />
            {errors.novoValor ? (
              <span className="form-error">{errors.novoValor}</span>
            ) : (
              <span className="form-hint">Deixe em branco para manter o atual.</span>
            )}
          </div>

          {/* Nova data de vencimento (opcional) */}
          <div className="form-group">
            <label htmlFor="novaDataVencimento">
              Nova data de vencimento (opcional)
            </label>
            <input
              type="date"
              id="novaDataVencimento"
              name="novaDataVencimento"
              value={form.novaDataVencimento}
              onChange={handleChange}
              disabled={loading}
            />
            <span className="form-hint">Deixe em branco para manter a atual.</span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <Spinner /> : null}
              {loading ? 'Salvando…' : 'Salvar aditamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
