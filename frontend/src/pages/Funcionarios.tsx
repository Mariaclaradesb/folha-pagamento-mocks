import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { mensagemErro, moeda, solicitar, type Funcionario } from '../api/client'
import {
  Cabecalho,
  Carregando,
  Falha,
  Modal,
  Vazio,
} from '../components/Comuns'
import { useAvisos } from '../components/Layout'
import { useRecurso } from '../hooks/useRecurso'

export function Funcionarios() {
  const [cargo, setCargo] = useState('')
  const [limite, setLimite] = useState('')
  const [filtros, setFiltros] = useState({ cargo: '', limite: '' })
  const [dialogo, setDialogo] = useState<{
    tipo: 'excluir' | 'reajustar'
    funcionario: Funcionario
  } | null>(null)
  const caminho = filtros.cargo
    ? `/funcionarios/cargo/${encodeURIComponent(filtros.cargo)}`
    : filtros.limite
      ? `/funcionarios/salario-abaixo-de/${filtros.limite}`
      : '/funcionarios'
  const { dados, carregando, erro, recarregar } =
    useRecurso<Funcionario[]>(caminho)
  const avisar = useAvisos()
  const funcionarios =
    dados?.filter(
      (pessoa) =>
        !filtros.limite || pessoa.salarioBase < Number(filtros.limite),
    ) ?? []
  const filtrado = Boolean(filtros.cargo || filtros.limite)

  function filtrar(event: FormEvent) {
    event.preventDefault()
    if (limite && (!Number.isFinite(Number(limite)) || Number(limite) <= 0)) {
      avisar({
        tipo: 'erro',
        mensagem: 'Informe um limite salarial maior que zero.',
      })
      return
    }
    avisar(null)
    setFiltros({ cargo: cargo.trim(), limite })
    recarregar()
  }

  return (
    <>
      <Cabecalho
        etiqueta="GESTÃO DE PESSOAS"
        titulo="Funcionários"
        descricao="Cuide da sua equipe. Organize os próximos passos."
      >
        <Link
          className="button"
          to="/funcionarios/novo"
          data-cy="novo-funcionario"
        >
          <span aria-hidden="true">＋</span> Novo funcionário
        </Link>
      </Cabecalho>
      <div className="summary-grid">
        <section className="summary-card">
          <span className="summary-symbol" aria-hidden="true">
            ♧
          </span>
          <p>
            {filtrado ? 'Funcionários no filtro' : 'Funcionários cadastrados'}
          </p>
          <strong data-cy="quantidade-funcionarios">
            {carregando ? '—' : erro ? '—' : funcionarios.length}
          </strong>
          <small>Sua equipe em um só lugar</small>
        </section>
        <section className="summary-card">
          <span className="summary-symbol" aria-hidden="true">
            R$
          </span>
          <p>Salários-base {filtrado ? 'no filtro' : 'da equipe'}</p>
          <strong>
            {carregando || erro
              ? '—'
              : moeda(
                  funcionarios.reduce(
                    (soma, item) => soma + item.salarioBase,
                    0,
                  ),
                )}
          </strong>
          <small>Valor bruto dos salários cadastrados</small>
        </section>
        <section className="summary-card accent-card">
          <p>Do cadastro ao pagamento</p>
          <h2>Uma rotina mais simples.</h2>
          <Link to="/folhas/nova">
            Simular ou gerar uma folha <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>
              Sua equipe{' '}
              <span className="count-pill">
                {carregando || erro ? '—' : funcionarios.length}
              </span>
            </h2>
            <p className="muted">
              Consulte e gerencie os funcionários cadastrados.
            </p>
          </div>
          <span className="badge neutral">
            {filtrado ? 'Filtros aplicados' : 'Todos os funcionários'}
          </span>
        </div>
        <form
          className="filter-bar"
          onSubmit={filtrar}
          noValidate
          aria-label="Filtros de funcionários"
        >
          <div className="field">
            <label htmlFor="filtro-cargo">Cargo</label>
            <input
              id="filtro-cargo"
              data-cy="filtro-cargo"
              value={cargo}
              onChange={(event) => setCargo(event.target.value)}
              placeholder="Digite o cargo"
              disabled={carregando}
            />
          </div>
          <div className="field">
            <label htmlFor="filtro-salario">Salário abaixo de (R$)</label>
            <input
              id="filtro-salario"
              data-cy="filtro-salario"
              type="number"
              min="0.01"
              step="0.01"
              value={limite}
              onChange={(event) => setLimite(event.target.value)}
              placeholder="Ex.: 6.000,00"
              disabled={carregando}
            />
          </div>
          <button
            className="button secondary"
            disabled={carregando}
            data-cy="aplicar-filtros"
          >
            Filtrar
          </button>
          <button
            className="button text-button"
            type="button"
            disabled={carregando}
            data-cy="limpar-filtros"
            onClick={() => {
              setCargo('')
              setLimite('')
              setFiltros({ cargo: '', limite: '' })
              avisar(null)
              recarregar()
            }}
          >
            Limpar
          </button>
        </form>
        {carregando ? (
          <Carregando />
        ) : erro ? (
          <Falha tentar={recarregar} />
        ) : funcionarios.length === 0 ? (
          <Vazio>
            <h3>
              {filtrado
                ? 'Nenhum funcionário encontrado'
                : 'Sua equipe começa aqui'}
            </h3>
            <p>
              {filtrado
                ? 'Experimente outros filtros ou limpe a busca.'
                : 'Cadastre o primeiro funcionário para começar.'}
            </p>
          </Vazio>
        ) : (
          <div className="table-scroll">
            <table data-cy="tabela-funcionarios">
              <caption className="sr-only">Lista de funcionários</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Funcionário</th>
                  <th scope="col">Cargo</th>
                  <th scope="col" className="numeric">
                    Salário-base
                  </th>
                  <th scope="col" className="actions-heading">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((pessoa) => (
                  <tr key={pessoa.id} data-cy={`funcionario-${pessoa.id}`}>
                    <td className="id-cell">#{pessoa.id}</td>
                    <td>
                      <div className="person">
                        <span className="person-avatar" aria-hidden="true">
                          {pessoa.nome.slice(0, 1).toLocaleUpperCase('pt-BR')}
                        </span>
                        <strong data-cy="funcionario-nome">
                          {pessoa.nome}
                        </strong>
                      </div>
                    </td>
                    <td data-cy="funcionario-cargo">
                      <span className="cargo-tag">{pessoa.cargo}</span>
                    </td>
                    <td
                      className="numeric salary"
                      data-cy="funcionario-salario"
                    >
                      {moeda(pessoa.salarioBase)}
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link
                          to={`/funcionarios/${pessoa.id}/editar`}
                          data-cy="editar-funcionario"
                          aria-label={`Editar ${pessoa.nome}`}
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          data-cy="reajustar-funcionario"
                          onClick={() => {
                            avisar(null)
                            setDialogo({
                              tipo: 'reajustar',
                              funcionario: pessoa,
                            })
                          }}
                          aria-label={`Reajustar salário de ${pessoa.nome}`}
                        >
                          Reajustar
                        </button>
                        <button
                          className="danger-text"
                          type="button"
                          data-cy="excluir-funcionario"
                          onClick={() => {
                            avisar(null)
                            setDialogo({ tipo: 'excluir', funcionario: pessoa })
                          }}
                          aria-label={`Excluir ${pessoa.nome}`}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!carregando && !erro && (
          <div className="table-footer" role="status">
            {funcionarios.length}{' '}
            {funcionarios.length === 1
              ? 'funcionário encontrado'
              : 'funcionários encontrados'}
            <span>Organizado por ID</span>
          </div>
        )}
      </section>
      {dialogo && (
        <AcaoFuncionario
          key={`${dialogo.tipo}-${dialogo.funcionario.id}`}
          {...dialogo}
          fechar={() => setDialogo(null)}
          concluir={() => {
            setDialogo(null)
            recarregar()
          }}
        />
      )}
    </>
  )
}

function AcaoFuncionario({
  tipo,
  funcionario,
  fechar,
  concluir,
}: {
  tipo: 'excluir' | 'reajustar'
  funcionario: Funcionario
  fechar: () => void
  concluir: () => void
}) {
  const [percentual, setPercentual] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const avisar = useAvisos()
  const excluir = tipo === 'excluir'
  const valido = Number.isFinite(Number(percentual)) && Number(percentual) > 0
  async function confirmar(event: FormEvent) {
    event.preventDefault()
    if (ocupado) return
    if (!excluir && !valido) {
      setErro('Informe um percentual maior que zero.')
      return
    }
    setOcupado(true)
    setErro('')
    avisar(null)
    try {
      await solicitar<Funcionario | void>(
        `/funcionarios/${funcionario.id}${excluir ? '' : `/salario?percentual=${encodeURIComponent(percentual)}`}`,
        { method: excluir ? 'DELETE' : 'PATCH' },
      )
      avisar({
        tipo: 'sucesso',
        mensagem: excluir
          ? 'Funcionário excluído com sucesso.'
          : 'Salário reajustado com sucesso.',
      })
      concluir()
    } catch (error) {
      const mensagem = mensagemErro(error)
      setErro(mensagem)
      avisar({ tipo: 'erro', mensagem })
    } finally {
      setOcupado(false)
    }
  }
  return (
    <Modal
      titulo={excluir ? 'Excluir funcionário' : 'Reajustar salário'}
      fechar={fechar}
      ocupado={ocupado}
    >
      <form onSubmit={(event) => void confirmar(event)} noValidate>
        <p className="muted">
          {excluir ? (
            <>
              Deseja excluir <strong>{funcionario.nome}</strong>? Esta ação
              remove o cadastro.
            </>
          ) : (
            <>
              Atualize o salário de <strong>{funcionario.nome}</strong>.
            </>
          )}
        </p>
        {!excluir && (
          <>
            <div className="field">
              <label htmlFor="percentual">Percentual de reajuste (%)</label>
              <input
                id="percentual"
                data-cy="percentual-reajuste"
                type="number"
                min="0.01"
                step="any"
                required
                value={percentual}
                onChange={(event) => setPercentual(event.target.value)}
                disabled={ocupado}
                autoFocus
              />
            </div>
            <div className="preview-box">
              <span>
                Salário atual <strong>{moeda(funcionario.salarioBase)}</strong>
              </span>
              <span>
                Prévia do novo salário{' '}
                <strong data-cy="previa-salario">
                  {valido
                    ? moeda(
                        funcionario.salarioBase *
                          (1 + Number(percentual) / 100),
                      )
                    : '—'}
                </strong>
              </span>
            </div>
            <p className="footnote">
              Prévia informativa. O valor final será confirmado pelo servidor.
            </p>
          </>
        )}
        {erro && (
          <p className="inline-error" role="alert" data-cy="erro-dialogo">
            {erro}
          </p>
        )}
        <div className="form-actions">
          <button
            className="button secondary"
            type="button"
            onClick={fechar}
            disabled={ocupado}
            data-cy="cancelar-dialogo"
          >
            Cancelar
          </button>
          <button
            className={`button ${excluir ? 'danger' : ''}`}
            disabled={ocupado}
            data-cy="confirmar-dialogo"
          >
            {ocupado
              ? 'Processando…'
              : excluir
                ? 'Confirmar exclusão'
                : 'Confirmar reajuste'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
