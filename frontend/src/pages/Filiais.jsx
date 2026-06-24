import { useState, useEffect, useCallback } from 'react';
import { filiaisAPI, transacoesAPI } from '../services/api';
import { useToast } from '../components/ToastContext';
import Modal from '../components/Modal';

const R = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Filiais() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [trans, setTrans] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', cidade: '', endereco: '', responsavel: '' });

  const fetch = useCallback(async () => {
    try {
      const [filiaisData, transData] = await Promise.all([filiaisAPI.list(), transacoesAPI.list()]);
      setList(filiaisData);
      setTrans(transData);
    } catch { toast('Erro ao carregar filiais', 'err'); }
  }, [toast]);

  useEffect(() => { fetch(); }, [fetch]);

  const openNew = () => {
    setEditing(null);
    setForm({ nome: '', cidade: '', endereco: '', responsavel: '' });
    setModalOpen(true);
  };

  const openEdit = f => {
    setEditing(f);
    setForm({ nome: f.nome, cidade: f.cidade, endereco: f.endereco || '', responsavel: f.responsavel || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome || !form.cidade) { toast('Nome e cidade são obrigatórios.', 'err'); return; }
    try {
      if (editing) {
        await filiaisAPI.update(editing.id, form);
        toast('Filial atualizada!');
      } else {
        await filiaisAPI.create(form);
        toast('Filial cadastrada!');
      }
      setModalOpen(false);
      fetch();
    } catch { toast('Erro ao salvar filial', 'err'); }
  };

  const handleDelete = async id => {
    if (!confirm('Remover esta filial?')) return;
    try {
      await filiaisAPI.remove(id);
      toast('Filial removida.', 'err');
      fetch();
    } catch { toast('Erro ao remover filial', 'err'); }
  };

  const ganhoTotal = trans.filter(t => t.tipo === 'ganho').reduce((a, t) => a + Number(t.valor || 0), 0);

  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <div className="panel-head-left">
            <h3>Unidades da Empresa</h3>
            <p>Gestão e indicadores de cada filial</p>
          </div>
          <button className="btn btn-fire" onClick={openNew}>＋ Nova Filial</button>
        </div>
        <div className="filial-grid">
          {list.map(f => {
            const g = trans.filter(t => t.tipo === 'ganho' && t.filial_id === f.id).reduce((a, t) => a + Number(t.valor || 0), 0);
            const pct = ganhoTotal > 0 ? Math.min(100, Math.round((g / ganhoTotal) * 100)) : 0;
            return (
              <div className="filial-card" key={f.id}>
                <div className="fc-name">{f.nome}</div>
                <div className="fc-city">📍 {f.cidade} · {f.endereco || '—'}</div>
                <div className="fc-stats">
                  <div className="fc-stat"><label>Funcionários</label><strong>{f.total_funcionarios}</strong></div>
                  <div className="fc-stat"><label>Faturamento</label><strong className="sage">{R(g)}</strong></div>
                  <div className="fc-stat"><label>Participação</label><strong className="fire">{pct}%</strong></div>
                </div>
                <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%`, background: 'var(--fire)' }}></div></div>
                <div className="fc-info" style={{ marginTop: 10 }}>Responsável: <span>{f.responsavel || '—'}</span></div>
                <div className="fc-actions">
                  <button className="btn btn-ghost-edit btn-sm" onClick={() => openEdit(f)}>✏️ Editar</button>
                  <button className="btn btn-ghost-danger btn-sm" onClick={() => handleDelete(f.id)}>🗑️ Remover</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal id="filial" title={editing ? 'Editar Filial' : 'Nova Filial'} subtitle="Cadastre uma nova unidade da empresa" open={modalOpen} onClose={() => setModalOpen(false)}
        footer={<><button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button><button className="btn btn-fire" onClick={handleSave}>🏢 Salvar Filial</button></>}>
        <div className="fgrid">
          <div className="fg">
            <label>Nome da Filial</label>
            <input type="text" placeholder="Ex: Unidade Paulista" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Cidade</label>
            <input type="text" placeholder="Ex: Paulista" value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} />
          </div>
          <div className="fg full">
            <label>Endereço Completo</label>
            <input type="text" placeholder="Rua, número, bairro" value={form.endereco} onChange={e => setForm(p => ({ ...p, endereco: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Responsável / Gerente</label>
            <input type="text" placeholder="Nome do responsável" value={form.responsavel} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))} />
          </div>
          {editing && (
            <div className="fg">
              <label>Nº de Funcionários</label>
              <input type="number" placeholder="0" disabled value={editing.total_funcionarios || 0} />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
