import { useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/ThemeContext';

const PAGE_META = {
  '/dashboard': ['Dashboard', 'Visão geral do sistema'],
  '/funcionarios': ['Funcionários', 'Gerencie sua equipe de colaboradores'],
  '/financeiro': ['Financeiro', 'Controle de ganhos e despesas'],
  '/producao': ['Produção', 'Registro de pratos produzidos por dia'],
  '/mensal': ['Controle Mensal', 'Análise de desempenho por período'],
  '/filiais': ['Filiais', 'Gestão de unidades e desempenho'],
  '/relatorios': ['Relatórios', 'Indicadores e análises automáticas'],
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { dark, toggle } = useTheme();
  const [title, sub] = PAGE_META[pathname] || ['', ''];

  return (
    <header className="topbar">
      <div className="page-title">
        <span className="ptitle">{title}</span>
        <span className="psub">{sub}</span>
      </div>
      <div className="topbar-actions">
        <div className="icon-btn" title="Notificações">
          🔔<span className="dot"></span>
        </div>
        <div className="icon-btn" title={dark ? 'Modo Claro' : 'Modo Escuro'} onClick={toggle}>{dark ? '☀️' : '🌙'}</div>
        <div className="topbar-avatar">AD</div>
      </div>
    </header>
  );
}
