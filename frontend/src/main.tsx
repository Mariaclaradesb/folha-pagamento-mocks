import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Funcionarios } from './pages/Funcionarios'
import { FormularioFuncionario } from './pages/FormularioFuncionario'
import { NovaFolha } from './pages/NovaFolha'
import { Folhas, DetalheFolha } from './pages/Folhas'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/funcionarios" replace />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route
            path="/funcionarios/novo"
            element={<FormularioFuncionario />}
          />
          <Route
            path="/funcionarios/:id/editar"
            element={<FormularioFuncionario />}
          />
          <Route path="/folhas" element={<Folhas />} />
          <Route path="/folhas/nova" element={<NovaFolha />} />
          <Route path="/folhas/:id" element={<DetalheFolha />} />
          <Route
            path="*"
            element={
              <section className="empty-state">
                <h1>Página não encontrada</h1>
                <Link to="/funcionarios">Voltar para funcionários</Link>
              </section>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
