import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const R = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const N = v => Number(v).toLocaleString('pt-BR');
const DT = d => { if (!d) return '—'; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardAPI.stats().then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="content"><p style={{color:'var(--ink4)'}}>Carregando dashboard...</p></div>;

  const { kpis, mensal, producao_hoje, transacoes_recentes } = data;
  const max = Math.max(...mensal.map(m => m.ganhos), 1);

  return (
    <div className="content">
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-glow" style={{ background: 'var(--sage)' }}></div>
          <span className="kpi-icon">💰</span>
          <div className="kpi-label">Ganhos do Mês</div>
          <div className="kpi-val sage">{R(kpis.ganhos)}</div>
          <span className="kpi-delta delta-up">▲ acumulado</span>
        </div>
        <div className="kpi">
          <div className="kpi-glow" style={{ background: 'var(--rouge)' }}></div>
          <span className="kpi-icon">💸</span>
          <div className="kpi-label">Gastos do Mês</div>
          <div className="kpi-val rouge">{R(kpis.gastos)}</div>
          <span className="kpi-delta delta-dn">▼ acumulado</span>
        </div>
        <div className="kpi">
          <div className="kpi-glow" style={{ background: 'var(--fire)' }}></div>
          <span className="kpi-icon">📈</span>
          <div className="kpi-label">Lucro Líquido</div>
          <div className="kpi-val fire">{R(kpis.lucro)}</div>
          <span className="kpi-delta delta-up">{kpis.ganhos > 0 ? ((kpis.lucro / kpis.ganhos) * 100).toFixed(1) + '% margem' : '—'}</span>
        </div>
        <div className="kpi">
          <div className="kpi-glow" style={{ background: 'var(--gold)' }}></div>
          <span className="kpi-icon">👨‍🍳</span>
          <div className="kpi-label">Funcionários</div>
          <div className="kpi-val gold">{N(kpis.funcionarios)}</div>
          <span className="kpi-delta delta-up">ativos</span>
        </div>
        <div className="kpi">
          <div className="kpi-glow" style={{ background: 'var(--sky)' }}></div>
          <span className="kpi-icon">🏢</span>
          <div className="kpi-label">Filiais</div>
          <div className="kpi-val sky">{N(kpis.filiais)}</div>
          <span className="kpi-delta delta-up">unidades</span>
        </div>
        <div className="kpi">
          <div className="kpi-glow" style={{ background: 'var(--fire)' }}></div>
          <span className="kpi-icon">📦</span>
          <div className="kpi-label">Porções Hoje</div>
          <div className="kpi-val fire">{N(kpis.porcoes_hoje)}</div>
          <span className="kpi-delta delta-up">produzidas</span>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-head-left">
              <h3>Resultado Mensal</h3>
              <p>Ganhos, gastos e lucro por mês</p>
            </div>
          </div>
          <div className="chart-area">
            {mensal.map(m => {
              const lucro = Math.max(0, m.ganhos - m.gastos);
              return (
                <div className="cbar-g" key={m.mes_ano}>
                  <div className="cbar-bars">
                    <div className="cbar" style={{ height: `${(m.ganhos / max * 100).toFixed(0)}%`, background: 'var(--sage)' }} title={R(m.ganhos)}></div>
                    <div className="cbar" style={{ height: `${(m.gastos / max * 100).toFixed(0)}%`, background: 'var(--rouge)' }} title={R(m.gastos)}></div>
                    <div className="cbar" style={{ height: `${(lucro / max * 100).toFixed(0)}%`, background: 'var(--fire)' }} title={R(lucro)}></div>
                  </div>
                  <span className="cbar-lbl">{m.mes_ano?.slice(5) || '?'}</span>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--sage)' }}></div> Ganhos</div>
            <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--rouge)' }}></div> Gastos</div>
            <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--fire)' }}></div> Lucro</div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-head-left">
              <h3>🍽️ Produção Hoje</h3>
              <p>Registros do dia</p>
            </div>
          </div>
          <div style={{ padding: '10px 14px' }}>
            {producao_hoje.length ? producao_hoje.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderBottom: '1px solid var(--c1)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{p.prato}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 2 }}>{p.filial_nome}</div>
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: 'var(--fire)' }}>{N(p.porcoes)}</div>
              </div>
            )) : <div className="empty-state"><div className="ei">🍽️</div><p>Nenhuma produção hoje</p></div>}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-head-left">
            <h3>Últimas Transações</h3>
            <p>Movimentações financeiras recentes</p>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Descrição</th><th>Tipo</th><th>Categoria</th><th>Valor</th><th>Data</th><th>Filial</th></tr></thead>
            <tbody>
              {transacoes_recentes.map(t => (
                <tr key={t.id}>
                  <td>{t.descricao}</td>
                  <td><span className={`badge ${t.tipo === 'ganho' ? 'b-sage' : 'b-rouge'}`}>{t.tipo === 'ganho' ? 'Ganho' : 'Gasto'}</span></td>
                  <td><span className="badge b-ink">{t.categoria}</span></td>
                  <td style={{ fontWeight: 700, color: t.tipo === 'ganho' ? 'var(--sage)' : 'var(--rouge)' }}>{R(t.valor)}</td>
                  <td>{DT(t.data)}</td>
                  <td>{t.filial_nome || 'Todas as Filiais'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
