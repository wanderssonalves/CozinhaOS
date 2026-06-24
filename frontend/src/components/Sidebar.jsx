import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { section: 'Principal', items: [{ label: 'Dashboard', icon: '📊', path: '/dashboard' }] },
  {
    section: 'Operações',
    items: [
      { label: 'Funcionários', icon: '👨‍🍳', path: '/funcionarios' },
      { label: 'Financeiro', icon: '💰', path: '/financeiro' },
      { label: 'Produção', icon: '🍽️', path: '/producao' },
    ],
  },
  {
    section: 'Análises',
    items: [
      { label: 'Controle Mensal', icon: '📅', path: '/mensal' },
      { label: 'Filiais', icon: '🏢', path: '/filiais' },
      { label: 'Relatórios', icon: '📈', path: '/relatorios' },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">🍲</div>
        <div className="brand-text">
          <div className="name">CozinhaOS</div>
          <div className="tagline">Gestão Industrial</div>
        </div>
      </div>

      {NAV_ITEMS.map(group => (
        <div className="nav-group" key={group.section}>
          <div className="nav-label">{group.section}</div>
          {group.items.map(item => (
            <button
              key={item.path}
              className={`nav-btn${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="user-avatar">AD</div>
        <div className="user-info">
          <div className="uname">Administrador</div>
          <div className="urole">Acesso total</div>
        </div>
      </div>
    </aside>
  );
}
