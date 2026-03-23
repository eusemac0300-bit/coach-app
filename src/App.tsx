import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Agenda } from './pages/Agenda';
import { Finanzas } from './pages/Finanzas';
import { Perfil } from './pages/Perfil';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/finanzas" element={<Finanzas />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
