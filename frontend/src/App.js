import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Animais from './pages/Animais';
import Movimentacoes from './pages/Movimentacoes';
import Eventos from './pages/Eventos';
import Despesas from './pages/Despesas';
import Relatorios from './pages/Relatorios';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="animais" element={<Animais />} />
            <Route path="movimentacoes" element={<Movimentacoes />} />
            <Route path="eventos" element={<Eventos />} />
            <Route path="despesas" element={<Despesas />} />
            <Route path="relatorios" element={<Relatorios />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
