import { createContext, useCallback, useContext, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

type Aviso = { tipo: 'erro' | 'sucesso'; mensagem: string }
const AvisosContext = createContext<(aviso: Aviso | null) => void>(
  () => undefined,
)
export const useAvisos = () => useContext(AvisosContext)

export function Layout() {
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const avisar = useCallback((novo: Aviso | null) => setAviso(novo), [])
  const location = useLocation()
  return (
    <AvisosContext.Provider value={avisar}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <Link
          to="/funcionarios"
          className="brand"
          aria-label="Folha de pagamento, início"
        >
          <span className="brand-icon">
            f<span>.</span>
          </span>
          <span>
            folha<span className="brand-subtitle">GESTÃO DE PAGAMENTO</span>
          </span>
        </Link>
        <p className="nav-label">ÁREA DE TRABALHO</p>
        <nav aria-label="Navegação principal">
          <NavLink to="/funcionarios" data-cy="menu-funcionarios">
            <span aria-hidden="true">♧</span> Funcionários
          </NavLink>
          <NavLink to="/folhas" end data-cy="menu-folhas">
            <span aria-hidden="true">▤</span> Folhas de pagamento
          </NavLink>
          <NavLink to="/folhas/nova" data-cy="menu-gerar">
            <span aria-hidden="true">＋</span> Gerar folha
          </NavLink>
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" /> Seu trabalho, organizado.
          <p>
            Pessoas e pagamentos
            <br />
            em um só lugar.
          </p>
        </div>
        <div className="sidebar-footer">
          <span className="avatar">RH</span>
          <div>
            Gestão de pessoas<small>Folha de pagamento</small>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Área de trabalho <span className="breadcrumb-divider">/</span>{' '}
            <strong>
              {location.pathname.startsWith('/funcionarios')
                ? 'Funcionários'
                : 'Folhas de pagamento'}
            </strong>
          </span>
          <span className="environment">
            <span className="status-dot" /> Ambiente local
          </span>
        </header>
        <main id="conteudo" tabIndex={-1}>
          <div className="messages" aria-live="polite">
            {aviso && (
              <div
                className={`banner ${aviso.tipo}`}
                role={aviso.tipo === 'erro' ? 'alert' : 'status'}
                data-cy={
                  aviso.tipo === 'erro' ? 'mensagem-erro' : 'mensagem-sucesso'
                }
              >
                <span>{aviso.mensagem}</span>
                <button
                  className="icon-button"
                  aria-label="Fechar mensagem"
                  onClick={() => setAviso(null)}
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <Outlet />
        </main>
        <footer className="page-footer">
          Folha de pagamento{' '}
          <span>Feito para cuidar de quem faz acontecer.</span>
        </footer>
      </div>
    </AvisosContext.Provider>
  )
}
