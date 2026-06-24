import { useState, useEffect, useCallback } from 'react';
import { funcionariosAPI, filiaisAPI } from '../services/api';
import { useToast } from '../components/ToastContext';
import Modal from '../components/Modal';

const R = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const DT = d => { if (!d) return '—'; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };

export default function Funcionarios() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', cargo: '', filial_id: '', salario: '', admissao: '', status: 'ativo' });

  const fetch = useCallback(async search => {
    try {
      const data = await funcionariosAPI.list(search || undefined);
      setList(data);
    } catch { toast('Erro ao carregar funcionários', 'err'); }
  }, [toast]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    filiaisAPI.list().then(setFiliais).catch(() => {});
  }, []);

  const handleSearch = useCallback(val => {
    setQ(val);
    fetch(val);
  }, [fetch]);

  const openNew = () => {
    setEditing(null);
    setForm({ nome: '', cargo: '', filial_id: '', salario: '', admissao: '', status: 'ativo' });
    setModalOpen(true);
  };

  const openEdit = f => {
    setEditing(f);
    setForm({ nome: f.nome, cargo: f.cargo, filial_id: f.filial_id, salario: f.salario, admissao: f.admissao, status: f.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome || !form.cargo || !form.filial_id || !form.salario) {
      toast('Preencha todos os campos obrigatórios.', 'err');
      return;
    }
    const salario = parseFloat(form.salario.toString().replace(/\./g, '').replace(',', '.'));
    if (isNaN(salario) || salario <= 0) { toast('Salário inválido.', 'err'); return; }
    try {
      const payload = { ...form, salario };
      if (editing) {
        await funcionariosAPI.update(editing.id, payload);
        toast('Funcionário atualizado!');
      } else {
        await funcionariosAPI.create(payload);
        toast('Funcionário cadastrado!');
      }
      setModalOpen(false);
      fetch(q);
    } catch { toast('Erro ao salvar funcionário', 'err'); }
  };

  const handleDelete = async id => {
    if (!confirm('Remover este funcionário?')) return;
    try {
      await funcionariosAPI.remove(id);
      toast('Funcionário removido.', 'err');
      fetch(q);
    } catch { toast('Erro ao remover funcionário', 'err'); }
  };

  const ativos = list.filter(f => f.status === 'ativo').length;

  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <div className="panel-head-left">
            <h3>Equipe de Colaboradores</h3>
            <p>{list.length} funcionário(s) · {ativos} ativo(s)</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="search-wrap">
              <span>🔍</span>
              <input type="text" placeholder="Buscar por nome ou cargo..." value={q} onChange={e => handleSearch(e.target.value)} />
            </div>
            <button className="btn btn-fire" onClick={openNew}>＋ Novo Funcionário</button>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>Nome</th><th>Cargo</th><th>Filial</th><th>Salário</th><th>Admissão</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {list.length ? list.map(f => (
                <tr key={f.id}>
                  <td>{f.nome}</td>
                  <td>{f.cargo}</td>
                  <td>{f.filial_nome}</td>
                  <td style={{ fontWeight: 700, color: 'var(--sage)' }}>{R(f.salario)}</td>
                  <td>{DT(f.admissao)}</td>
                  <td><span className={`badge ${f.status === 'ativo' ? 'b-sage' : 'b-rouge'}`}>{f.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost-edit btn-sm" onClick={() => openEdit(f)}>✏️ Editar</button>
                      <button className="btn btn-ghost-danger btn-sm" onClick={() => handleDelete(f.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={7}><div className="tbl-empty">Nenhum funcionário encontrado</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal id="func" title={editing ? 'Editar Funcionário' : 'Novo Funcionário'} subtitle="Preencha os dados do colaborador abaixo" open={modalOpen} onClose={() => setModalOpen(false)}
        footer={<><button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button><button className="btn btn-fire" onClick={handleSave}>💾 Salvar Funcionário</button></>}>
        <div className="fgrid">
          <div className="fg full">
            <label>Nome Completo</label>
            <input type="text" placeholder="Ex: João Silva" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Cargo</label>
            <select value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))}>
              <option value="">Selecione o cargo</option>
              <option>Cozinheiro</option><option>Auxiliar de Cozinha</option><option>Nutricionista</option>
              <option>Gerente</option><option>Atendente</option><option>Entregador</option><option>Administrativo</option>
            </select>
          </div>
          <div className="fg">
            <label>Filial</label>
            <select value={form.filial_id} onChange={e => setForm(p => ({ ...p, filial_id: e.target.value }))}>
              <option value="">Selecione a filial</option>
              {filiais.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Salário (R$)</label>
            <input type="number" placeholder="2.000,00" value={form.salario} onChange={e => setForm(p => ({ ...p, salario: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Data de Admissão</label>
            <input type="date" value={form.admissao} onChange={e => setForm(p => ({ ...p, admissao: e.target.value }))} />
          </div>
          <div className="fg full">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="ativo">✅ Ativo</option>
              <option value="inativo">⛔ Inativo</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
