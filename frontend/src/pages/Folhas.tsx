import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  exibirPeriodo,
  moeda,
  periodoValido,
  type Folha,
  type Funcionario,
} from '../api/client'
import {
  Cabecalho,
  Carregando,
  Falha,
  ValoresFolha,
  Vazio,
} from '../components/Comuns'
import { useAvisos } from '../components/Layout'
import { useRecurso } from '../hooks/useRecurso'

export function Folhas() {
  const equipe = useRecurso<Funcionario[]>('/funcionarios')
  const [modo, setModo] = useState<'funcionario' | 'periodo'>('funcionario')
  const [funcionarioId, setFuncionarioId] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [consulta, setConsulta] = useState<{
    caminho: string
    periodo: string
  } | null>(null)
  const [erro, setErro] = useState('')
  const folhas = useRecurso<Folha[]>(consulta?.caminho ?? null)
  const total = useRecurso<number>(
    consulta?.periodo
      ? `/folhas-pagamento/periodo/${consulta.periodo}/total-liquido`
      : null,
  )
  const avisar = useAvisos()
  const ocupado = equipe.carregando || folhas.carregando || total.carregando
  function consultar(event: FormEvent) {
    event.preventDefault()
    setErro('')
    avisar(null)
    if (modo === 'funcionario' && !funcionarioId) {
      setErro('Selecione um funcionário.')
      return
    }
    if (modo === 'periodo' && !periodoValido(periodo)) {
      setErro('Informe um período válido no formato AAAA-MM.')
      return
    }
    setConsulta({
      caminho:
        modo === 'funcionario'
          ? `/folhas-pagamento/funcionario/${funcionarioId}`
          : `/folhas-pagamento/periodo/${periodo}`,
      periodo: modo === 'periodo' ? periodo : '',
    })
    folhas.recarregar()
    total.recarregar()
  }
  function limparConsulta() {
    setConsulta(null)
    setErro('')
    avisar(null)
  }
  return (
    <>
      <Cabecalho
        etiqueta="HISTÓRICO DE PAGAMENTOS"
        titulo="Folhas de pagamento"
        descricao="Acompanhe os pagamentos por pessoa ou por mês."
      >
        <Link className="button" to="/folhas/nova" data-cy="nova-folha">
          ＋ Gerar folha
        </Link>
      </Cabecalho>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Consultar folhas</h2>
            <p className="muted">Escolha como deseja encontrar os registros.</p>
          </div>
        </div>
        <form className="query-form" onSubmit={consultar} noValidate>
          <fieldset className="segmented" disabled={ocupado}>
            <legend className="sr-only">Tipo de consulta</legend>
            <label>
              <input
                type="radio"
                name="modo"
                value="funcionario"
                data-cy="modo-funcionario"
                checked={modo === 'funcionario'}
                onChange={() => {
                  setModo('funcionario')
                  limparConsulta()
                }}
              />
              <span>Por funcionário</span>
            </label>
            <label>
              <input
                type="radio"
                name="modo"
                value="periodo"
                data-cy="modo-periodo"
                checked={modo === 'periodo'}
                onChange={() => {
                  setModo('periodo')
                  limparConsulta()
                }}
              />
              <span>Por período</span>
            </label>
          </fieldset>
          <div className="query-fields">
            {modo === 'funcionario' ? (
              <div className="field">
                <label htmlFor="consulta-funcionario">Funcionário</label>
                <select
                  id="consulta-funcionario"
                  data-cy="consulta-funcionario"
                  value={funcionarioId}
                  onChange={(event) => {
                    setFuncionarioId(event.target.value)
                    limparConsulta()
                  }}
                  disabled={ocupado || Boolean(equipe.erro)}
                  required
                >
                  <option value="">Selecione um funcionário</option>
                  {equipe.dados?.map((pessoa) => (
                    <option key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome} (#{pessoa.id})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="field">
                <label htmlFor="consulta-periodo">Período de referência</label>
                <input
                  id="consulta-periodo"
                  data-cy="consulta-periodo"
                  type="month"
                  min="0001-01"
                  max="9999-12"
                  value={periodo}
                  onChange={(event) => {
                    setPeriodo(event.target.value)
                    limparConsulta()
                  }}
                  disabled={ocupado}
                  required
                />
              </div>
            )}
            <button
              className="button"
              disabled={
                ocupado ||
                (modo === 'funcionario' &&
                  (Boolean(equipe.erro) || !equipe.dados?.length))
              }
              data-cy="consultar-folhas"
            >
              {ocupado ? 'Carregando…' : 'Consultar'}
            </button>
          </div>
          {erro && (
            <p role="alert" className="inline-error" data-cy="erro-formulario">
              {erro}
            </p>
          )}
        </form>
        {ocupado ? (
          <Carregando />
        ) : equipe.erro ? (
          <Falha tentar={equipe.recarregar} />
        ) : folhas.erro || total.erro ? (
          <Falha
            tentar={() => {
              folhas.recarregar()
              total.recarregar()
            }}
          />
        ) : consulta ? (
          <>
            {consulta.periodo && total.dados !== null && (
              <div className="monthly-total">
                <div>
                  <p className="eyebrow">TOTAL LÍQUIDO DO MÊS</p>
                  <span>{exibirPeriodo(consulta.periodo)}</span>
                </div>
                <strong data-cy="total-liquido">{moeda(total.dados)}</strong>
              </div>
            )}
            {folhas.dados?.length ? (
              <div className="table-scroll">
                <table data-cy="tabela-folhas">
                  <caption className="sr-only">Folhas encontradas</caption>
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Funcionário</th>
                      <th scope="col">Período</th>
                      <th scope="col" className="numeric">
                        Salário líquido
                      </th>
                      <th scope="col">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {folhas.dados.map((folha) => (
                      <tr key={folha.id} data-cy={`folha-${folha.id}`}>
                        <td className="id-cell">#{folha.id}</td>
                        <td>
                          <strong>{folha.funcionario.nome}</strong>
                        </td>
                        <td>{exibirPeriodo(folha.periodo)}</td>
                        <td className="numeric salary" data-cy="folha-liquido">
                          {moeda(folha.salarioLiquido)}
                        </td>
                        <td>
                          <Link
                            to={`/folhas/${folha.id}`}
                            className="table-link"
                            data-cy="ver-folha"
                          >
                            Ver folha →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="table-footer" role="status">
                  {folhas.dados.length}{' '}
                  {folhas.dados.length === 1
                    ? 'folha encontrada'
                    : 'folhas encontradas'}
                </div>
              </div>
            ) : (
              <Vazio>
                <h3>Nenhuma folha encontrada</h3>
                <p>Não há pagamentos para esta consulta.</p>
              </Vazio>
            )}
          </>
        ) : (
          <Vazio>
            <h3>
              {modo === 'funcionario' && !equipe.dados?.length
                ? 'Nenhum funcionário cadastrado'
                : 'Encontre um pagamento'}
            </h3>
            <p>
              {modo === 'funcionario' && !equipe.dados?.length
                ? 'Cadastre um funcionário ou consulte por período.'
                : 'Selecione os dados acima e clique em Consultar.'}
            </p>
          </Vazio>
        )}
      </section>
    </>
  )
}

export function DetalheFolha() {
  const { id } = useParams()
  const { dados, carregando, erro, recarregar } = useRecurso<Folha>(
    `/folhas-pagamento/${encodeURIComponent(id ?? '')}`,
  )
  return (
    <>
      <Link to="/folhas" className="back-link">
        ← Voltar para folhas
      </Link>
      <Cabecalho
        etiqueta="REGISTRO DE PAGAMENTO"
        titulo="Detalhe da folha"
        descricao="Consulte os valores registrados para este pagamento."
      />
      {carregando ? (
        <Carregando />
      ) : erro || !dados ? (
        <Falha tentar={recarregar} />
      ) : (
        <ValoresFolha folha={dados} />
      )}
    </>
  )
}
