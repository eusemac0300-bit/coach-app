import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Agenda } from './pages/Agenda';
import { Finanzas } from './pages/Finanzas';
import { Perfil } from './pages/Perfil';
import { CierreMes } from './pages/CierreMes';
import { ClienteDetalle } from './pages/ClienteDetalle';
import { SesionGrupal } from './pages/SesionGrupal';
import { Grupos } from './pages/Grupos';
import { Ejercicios } from './pages/Ejercicios';
import { SesionEntrenamiento } from './pages/SesionEntrenamiento';


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<ClienteDetalle />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/finanzas" element={<Finanzas />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/cierre-mes" element={<CierreMes />} />
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/sesion-grupal" element={<SesionGrupal />} />
          <Route path="/ejercicios" element={<Ejercicios />} />
          <Route path="/entrenamiento/:type/:id" element={<SesionEntrenamiento />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
