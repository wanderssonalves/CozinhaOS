import { useState, useEffect, useCallback } from 'react';
import { transacoesAPI, filiaisAPI } from '../services/api';
import { useToast } from '../components/ToastContext';
import Modal from '../components/Modal';

const R = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const DT = d => { if (!d) return '—'; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };

export default function Financeiro() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ tipo: 'ganho', descricao: '', categoria: 'Contrato Empresarial', valor: '', data: new Date().toISOString().split('T')[0], filial_id: '' });

  const fetch = useCallback(async search => {
    try {
      const data = await transacoesAPI.list(search || undefined);
      setList(data);
    } catch { toast('Erro ao carregar transações', 'err'); }
  }, [toast]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { filiaisAPI.list().then(setFiliais).catch(() => {}); }, []);

  const handleSearch = useCallback(val => { setQ(val); fetch(val); }, [fetch]);

  const openNew = () => {
    setForm({ tipo: 'ganho', descricao: '', categoria: 'Contrato Empresarial', valor: '', data: new Date().toISOString().split('T')[0], filial_id: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.descricao || !form.valor || !form.data) { toast('Preencha todos os campos.', 'err'); return; }
    const valor = parseFloat(form.valor.toString().replace(/\./g, '').replace(',', '.'));
    if (isNaN(valor) || valor <= 0) { toast('Valor inválido.', 'err'); return; }
    if (valor > 9999999999.99) { toast('Valor máximo é R$ 9.999.999.999,99.', 'err'); return; }
    try {
      await transacoesAPI.create({ ...form, valor });
      toast('Transação registrada!');
      setModalOpen(false);
      fetch(q);
    } catch { toast('Erro ao registrar transação', 'err'); }
  };

  const handleDelete = async id => {
    if (!confirm('Remover esta transação?')) return;
    try {
      await transacoesAPI.remove(id);
      toast('Transação removida.', 'err');
      fetch(q);
    } catch { toast('Erro ao remover transação', 'err'); }
  };

  const ganhos = list.filter(t => t.tipo === 'ganho').reduce((a, t) => a + Number(t.valor || 0), 0);
  const gastos = list.filter(t => t.tipo === 'gasto').reduce((a, t) => a + Number(t.valor || 0), 0);

  return (
    <div className="content">
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
        <div className="kpi"><span className="kpi-icon">💚</span><div className="kpi-label">Total Ganhos</div><div className="kpi-val sage">{R(ganhos)}</div></div>
        <div className="kpi"><span className="kpi-icon">🔴</span><div className="kpi-label">Total Gastos</div><div className="kpi-val rouge">{R(gastos)}</div></div>
        <div className="kpi"><span className="kpi-icon">⚖️</span><div className="kpi-label">Saldo Atual</div><div className="kpi-val fire">{R(ganhos - gastos)}</div></div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-head-left">
            <h3>Movimentações Financeiras</h3>
            <p>Registro completo de ganhos e gastos</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="search-wrap">
              <span>🔍</span>
              <input type="text" placeholder="Buscar transação..." value={q} onChange={e => handleSearch(e.target.value)} />
            </div>
            <button className="btn btn-fire" onClick={openNew}>＋ Nova Transação</button>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Tipo</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Data</th><th>Filial</th><th></th></tr></thead>
            <tbody>
              {list.length ? list.map(t => (
                <tr key={t.id}>
                  <td><span className={`badge ${t.tipo === 'ganho' ? 'b-sage' : 'b-rouge'}`}>{t.tipo === 'ganho' ? 'Ganho' : 'Gasto'}</span></td>
                  <td>{t.descricao}</td>
                  <td><span className="badge b-ink">{t.categoria}</span></td>
                  <td style={{ fontWeight: 700, color: t.tipo === 'ganho' ? 'var(--sage)' : 'var(--rouge)' }}>{R(t.valor)}</td>
                  <td>{DT(t.data)}</td>
                  <td>{t.filial_nome || 'Todas as Filiais'}</td>
                  <td><button className="btn btn-ghost-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑️</button></td>
                </tr>
              )) : <tr><td colSpan={7}><div className="tbl-empty">Nenhuma transação encontrada</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal id="fin" title="Nova Transação" subtitle="Registre um ganho ou gasto no sistema" open={modalOpen} onClose={() => setModalOpen(false)}
        footer={<><button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button><button className="btn btn-fire" onClick={handleSave}>💾 Registrar</button></>}>
        <div className="fgrid">
          <div className="fg">
            <label>Tipo</label>
            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
              <option value="ganho">💚 Ganho / Receita</option>
              <option value="gasto">🔴 Gasto / Despesa</option>
            </select>
          </div>
          <div className="fg">
            <label>Categoria</label>
            <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}>
              <option>Contrato Empresarial</option><option>Venda Direta</option><option>Evento</option>
              <option>Alimentos / Insumos</option><option>Energia Elétrica</option><option>Aluguel</option>
              <option>Manutenção</option><option>Folha de Pagamento</option><option>Transporte</option><option>Outros</option>
            </select>
          </div>
          <div className="fg full">
            <label>Descrição</label>
            <input type="text" placeholder="Ex: Contrato mensal Empresa ABC" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Valor (R$)</label>
            <input type="number" placeholder="1.000,00" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Data</label>
            <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} />
          </div>
          <div className="fg full">
            <label>Filial</label>
            <select value={form.filial_id} onChange={e => setForm(p => ({ ...p, filial_id: e.target.value }))}>
              <option value="">Todas as Filiais</option>
              {filiais.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
