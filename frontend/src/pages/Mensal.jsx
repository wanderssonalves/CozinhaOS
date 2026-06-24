import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const R = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Mensal() {
  const [mensais, setMensais] = useState([]);

  useEffect(() => {
    dashboardAPI.stats().then(d => setMensais(d.mensal)).catch(() => {});
  }, []);

  const max = Math.max(...mensais.map(m => m.ganhos), 1);
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="content">
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <div className="panel-head-left">
            <h3>Evolução Mensal</h3>
            <p>Comparativo de ganhos, gastos e lucro</p>
          </div>
        </div>
        <div className="chart-area" style={{ height: 180, padding: '22px 22px 10px' }}>
          {mensais.map(m => {
            const lucro = Math.max(0, m.ganhos - m.gastos);
            const mesNum = parseInt(m.mes_ano?.slice(5), 10);
            const nomeMes = meses[mesNum - 1] || m.mes_ano;
            return (
              <div className="cbar-g" key={m.mes_ano}>
                <div className="cbar-bars" style={{ height: 140 }}>
                  <div className="cbar" style={{ height: `${(m.ganhos / max * 100).toFixed(0)}%`, background: 'var(--sage)' }} title={R(m.ganhos)}></div>
                  <div className="cbar" style={{ height: `${(m.gastos / max * 100).toFixed(0)}%`, background: 'var(--rouge)' }} title={R(m.gastos)}></div>
                  <div className="cbar" style={{ height: `${(lucro / max * 100).toFixed(0)}%`, background: 'var(--fire)' }} title={R(lucro)}></div>
                </div>
                <span className="cbar-lbl">{nomeMes}</span>
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
          <div className="panel-head-left"><h3>Tabela Mensal Detalhada</h3><p>Resumo completo por período</p></div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Mês / Ano</th><th>Ganhos</th><th>Gastos</th><th>Lucro</th><th>Margem</th><th>Status</th></tr></thead>
            <tbody>
              {mensais.map(m => {
                const lucro = m.ganhos - m.gastos;
                const margem = m.ganhos > 0 ? ((lucro / m.ganhos) * 100).toFixed(1) : '0.0';
                const ok = lucro > 0;
                return (
                  <tr key={m.mes_ano}>
                    <td><strong>{m.mes_ano}</strong></td>
                    <td style={{ color: 'var(--sage)', fontWeight: 700 }}>{R(m.ganhos)}</td>
                    <td style={{ color: 'var(--rouge)', fontWeight: 700 }}>{R(m.gastos)}</td>
                    <td style={{ color: ok ? 'var(--fire)' : 'var(--rouge)', fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700 }}>{R(lucro)}</td>
                    <td>{margem}%</td>
                    <td><span className={`badge ${ok ? 'b-sage' : 'b-rouge'}`}>{ok ? 'Positivo' : 'Negativo'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
