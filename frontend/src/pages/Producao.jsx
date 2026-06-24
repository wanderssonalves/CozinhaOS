import { useState, useEffect, useCallback } from 'react';
import { producaoAPI, filiaisAPI } from '../services/api';
import { useToast } from '../components/ToastContext';
import Modal from '../components/Modal';

const N = v => Number(v).toLocaleString('pt-BR');
const DT = d => { if (!d) return '—'; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };

export default function Producao() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ data: new Date().toISOString().split('T')[0], prato: '', porcoes: '', filial_id: '' });

  const fetch = useCallback(async search => {
    try {
      const data = await producaoAPI.list(search || undefined);
      setList(data);
    } catch { toast('Erro ao carregar produção', 'err'); }
  }, [toast]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { filiaisAPI.list().then(setFiliais).catch(() => {}); }, []);

  const handleSearch = useCallback(val => { setQ(val); fetch(val); }, [fetch]);

  const openNew = () => {
    setForm({ data: new Date().toISOString().split('T')[0], prato: '', porcoes: '', filial_id: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.prato || !form.porcoes || !form.data) { toast('Preencha todos os campos.', 'err'); return; }
    const porcoes = parseInt(form.porcoes, 10);
    if (isNaN(porcoes) || porcoes <= 0) { toast('Quantidade de porções inválida.', 'err'); return; }
    try {
      await producaoAPI.create({ ...form, porcoes });
      toast('Produção registrada!');
      setModalOpen(false);
      fetch(q);
    } catch { toast('Erro ao registrar produção', 'err'); }
  };

  const handleDelete = async id => {
    if (!confirm('Remover este registro?')) return;
    try {
      await producaoAPI.remove(id);
      toast('Registro removido.', 'err');
      fetch(q);
    } catch { toast('Erro ao remover registro', 'err'); }
  };

  const total = list.reduce((a, p) => a + Number(p.porcoes || 0), 0);
  const dias = [...new Set(list.map(p => p.data))].length;

  return (
    <div className="content">
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <div className="panel-head-left">
            <h3>Controle de Produção Diária</h3>
            <p>Quantidade de pratos produzidos por dia e filial</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="search-wrap">
              <span>🔍</span>
              <input type="text" placeholder="Buscar prato ou filial..." value={q} onChange={e => handleSearch(e.target.value)} />
            </div>
            <button className="btn btn-fire" onClick={openNew}>＋ Registrar Produção</button>
          </div>
        </div>
        <div className="stat-strip">
          <div className="stat-item"><div className="s-val fire">{N(total)}</div><div className="s-lbl">Total de Porções</div></div>
          <div className="stat-item"><div className="s-val">{dias}</div><div className="s-lbl">Dias Registrados</div></div>
          <div className="stat-item"><div className="s-val">{dias ? N(Math.round(total / dias)) : 0}</div><div className="s-lbl">Média por Dia</div></div>
        </div>
        <div className="tbl-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Data</th><th>Prato</th><th>Porções</th><th>Filial</th><th></th></tr></thead>
            <tbody>
              {list.length ? list.map(p => (
                <tr key={p.id}>
                  <td>{DT(p.data)}</td>
                  <td>{p.prato}</td>
                  <td><span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: 'var(--fire)' }}>{N(p.porcoes)}</span> <span style={{ fontSize: 11, color: 'var(--ink4)' }}>porções</span></td>
                  <td>{p.filial_nome}</td>
                  <td><button className="btn btn-ghost-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button></td>
                </tr>
              )) : <tr><td colSpan={5}><div className="tbl-empty">Nenhum registro encontrado</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal id="prod" title="🍽️ Registrar Produção" subtitle="Informe o prato e a quantidade produzida" open={modalOpen} onClose={() => setModalOpen(false)}
        footer={<><button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button><button className="btn btn-fire" onClick={handleSave}>🍲 Registrar Produção</button></>}>
        <div className="fgrid">
          <div className="fg full">
            <label>Nome do Prato</label>
            <input type="text" placeholder="Ex: Arroz + Frango Grelhado + Salada" value={form.prato} onChange={e => setForm(p => ({ ...p, prato: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Quantidade de Porções</label>
            <input type="number" placeholder="300" value={form.porcoes} onChange={e => setForm(p => ({ ...p, porcoes: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Data de Produção</label>
            <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} />
          </div>
          <div className="fg full">
            <label>Filial</label>
            <select value={form.filial_id} onChange={e => setForm(p => ({ ...p, filial_id: e.target.value }))}>
              <option value="">Selecione a filial</option>
              {filiais.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
