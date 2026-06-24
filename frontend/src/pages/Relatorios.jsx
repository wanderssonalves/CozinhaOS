import { useState, useEffect } from 'react';
import { transacoesAPI, funcionariosAPI, filiaisAPI } from '../services/api';
import { exportRelatorio } from '../services/exportXlsx';

const R = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Relatorios() {
  const [trans, setTrans] = useState([]);
  const [funcs, setFuncs] = useState([]);
  const [filiais, setFiliais] = useState([]);

  useEffect(() => {
    Promise.all([
      transacoesAPI.list(),
      funcionariosAPI.list(),
      filiaisAPI.list(),
    ]).then(([t, f, fi]) => {
      setTrans(t);
      setFuncs(f);
      setFiliais(fi);
    }).catch(() => {});
  }, []);

  const cats = {};
  trans.filter(t => t.tipo === 'gasto').forEach(t => { cats[t.categoria] = (cats[t.categoria] || 0) + t.valor; });
  const sortC = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const maxC = sortC[0]?.[1] || 1;

  const filG = filiais.map(f => ({
    nome: f.nome,
    g: trans.filter(t => t.tipo === 'ganho' && t.filial_id === f.id).reduce((a, t) => a + Number(t.valor || 0), 0),
  })).sort((a, b) => b.g - a.g);
  const maxF = filG[0]?.g || 1;

  const ativos = funcs.filter(f => f.status === 'ativo');
  const folha = ativos.reduce((a, f) => a + Number(f.salario || 0), 0);
  const ganhoT = trans.filter(t => t.tipo === 'ganho').reduce((a, t) => a + Number(t.valor || 0), 0);

  return (
    <div className="content">
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-head-left"><h3>💸 Gastos por Categoria</h3><p>Distribuição de despesas</p></div>
          </div>
          <div style={{ padding: '20px 22px' }}>
            {sortC.length ? sortC.map(([c, v]) => (
              <div className="rel-row" key={c}>
                <div className="rel-label">{c}</div>
                <div className="rel-bar-wrap">
                  <div className="prog-bar"><div className="prog-fill" style={{ width: `${(v / maxC * 100).toFixed(0)}%`, background: 'var(--rouge)' }}></div></div>
                </div>
                <div className="rel-val" style={{ color: 'var(--rouge)' }}>{R(v)}</div>
              </div>
            )) : <div className="empty-state"><p>Nenhum gasto registrado</p></div>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-head-left"><h3>🏆 Ranking de Filiais</h3><p>Faturamento por unidade</p></div>
          </div>
          <div style={{ padding: '20px 22px' }}>
            {filG.map((f, i) => (
              <div className="rel-row" key={f.nome}>
                <div className="rel-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: i === 0 ? 'var(--fire)' : 'var(--ink4)' }}>{i + 1}</span>
                  {f.nome}
                </div>
                <div className="rel-bar-wrap">
                  <div className="prog-bar"><div className="prog-fill" style={{ width: `${(f.g / maxF * 100).toFixed(0)}%`, background: 'var(--fire)' }}></div></div>
                </div>
                <div className="rel-val" style={{ color: 'var(--sage)' }}>{R(f.g)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-head-left"><h3>👨‍🍳 Custo com Pessoal</h3><p>Análise da folha de pagamento</p></div>
          <button className="btn btn-fire" onClick={() => exportRelatorio(trans, funcs, filiais)}>📥 Exportar XLSX</button>
        </div>
        <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: 'var(--ink4)', marginBottom: 8 }}>Folha Mensal Total</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color: 'var(--fire)' }}>{R(folha)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: 'var(--ink4)', marginBottom: 8 }}>% do Faturamento</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color: 'var(--gold)' }}>{ganhoT > 0 ? ((folha / ganhoT) * 100).toFixed(1) + '%' : '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: 'var(--ink4)', marginBottom: 8 }}>Funcionários Ativos</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color: 'var(--sage)' }}>{ativos.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
