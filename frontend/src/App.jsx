import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Funcionarios from './pages/Funcionarios';
import Financeiro from './pages/Financeiro';
import Producao from './pages/Producao';
import Mensal from './pages/Mensal';
import Filiais from './pages/Filiais';
import Relatorios from './pages/Relatorios';

const PAGES = [
  { path: '/dashboard', component: Dashboard },
  { path: '/funcionarios', component: Funcionarios },
  { path: '/financeiro', component: Financeiro },
  { path: '/producao', component: Producao },
  { path: '/mensal', component: Mensal },
  { path: '/filiais', component: Filiais },
  { path: '/relatorios', component: Relatorios },
];

export default function App() {
  return (
    <>
      <Sidebar />
      <main className="main">
        <Topbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {PAGES.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Routes>
      </main>
    </>
  );
}
