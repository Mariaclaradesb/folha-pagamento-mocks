import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  mensagemErro,
  periodoValido,
  solicitar,
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

export function NovaFolha() {
  const {
    dados: funcionarios,
    carregando,
    erro: erroCarga,
    recarregar,
  } = useRecurso<Funcionario[]>('/funcionarios')
  const [funcionarioId, setFuncionarioId] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [simulacao, setSimulacao] = useState<Folha | null>(null)
  const [acao, setAcao] = useState<'simular' | 'gerar' | null>(null)
  const [erro, setErro] = useState('')
  const avisar = useAvisos()
  const navigate = useNavigate()
  function alterar() {
    setSimulacao(null)
    setErro('')
    avisar(null)
  }
  async function executar(simular: boolean) {
    if (acao) return
    setErro('')
    setSimulacao(null)
    avisar(null)
    if (!funcionarioId) {
      setErro('Selecione um funcionário.')
      return
    }
    if (!periodoValido(periodo)) {
      setErro('Informe um período válido no formato AAAA-MM.')
      return
    }
    setAcao(simular ? 'simular' : 'gerar')
    try {
      const folha = await solicitar<Folha>(
        `/folhas-pagamento${simular ? '/simulacao' : ''}`,
        {
          method: 'POST',
          body: JSON.stringify({
            funcionarioId: Number(funcionarioId),
            periodo,
          }),
        },
      )
      if (simular) {
        setSimulacao(folha)
        avisar({
          tipo: 'sucesso',
          mensagem: 'Simulação concluída. Nenhuma folha foi salva.',
        })
      } else {
        avisar({ tipo: 'sucesso', mensagem: 'Folha gerada com sucesso.' })
        navigate(`/folhas/${folha.id}`)
      }
    } catch (error) {
      const mensagem = mensagemErro(error)
      setErro(mensagem)
      avisar({ tipo: 'erro', mensagem })
    } finally {
      setAcao(null)
    }
  }
  return (
    <>
      <Cabecalho
        etiqueta="ROTINA DE PAGAMENTOS"
        titulo="Gerar folha"
        descricao="Confira uma prévia ou registre o pagamento da sua equipe."
      />
      {carregando ? (
        <Carregando />
      ) : erroCarga ? (
        <Falha tentar={recarregar} />
      ) : !funcionarios?.length ? (
        <Vazio>
          <h2>Cadastre um funcionário para começar</h2>
          <Link to="/funcionarios/novo" className="button">
            Novo funcionário
          </Link>
        </Vazio>
      ) : (
        <div className="generation-layout">
          <section className="card form-card">
            <div className="card-heading">
              <div>
                <h2>Dados do pagamento</h2>
                <p className="muted">
                  Selecione o funcionário e o mês de referência.
                </p>
              </div>
            </div>
            <form
              className="form-body"
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                void executar(false)
              }}
            >
              <fieldset disabled={acao !== null}>
                <div className="field">
                  <label htmlFor="funcionario">Funcionário</label>
                  <select
                    id="funcionario"
                    data-cy="selecionar-funcionario"
                    value={funcionarioId}
                    onChange={(event) => {
                      setFuncionarioId(event.target.value)
                      alterar()
                    }}
                    required
                  >
                    <option value="">Selecione um funcionário</option>
                    {funcionarios.map((pessoa) => (
                      <option key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome} — {pessoa.cargo} (#{pessoa.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="periodo">Período de referência</label>
                  <input
                    id="periodo"
                    data-cy="periodo"
                    type="month"
                    min="0001-01"
                    max="9999-12"
                    value={periodo}
                    onChange={(event) => {
                      setPeriodo(event.target.value)
                      alterar()
                    }}
                    required
                  />
                </div>
              </fieldset>
              <p className="info-box">
                A simulação permite conferir os valores antes de salvar. Cada
                geração cria uma nova folha de pagamento.
              </p>
              {erro && (
                <p
                  className="inline-error"
                  role="alert"
                  data-cy="erro-formulario"
                >
                  {erro}
                </p>
              )}
              <div className="form-actions">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => void executar(true)}
                  disabled={acao !== null}
                  data-cy="simular-folha"
                >
                  {acao === 'simular' ? 'Simulando…' : 'Simular'}
                </button>
                <button
                  className="button"
                  disabled={acao !== null}
                  data-cy="gerar-folha"
                >
                  {acao === 'gerar' ? 'Gerando…' : 'Gerar folha'}
                </button>
              </div>
            </form>
          </section>
          <aside className="help-card">
            <span className="eyebrow">ANTES DE GERAR</span>
            <h2>Clareza em cada valor.</h2>
            <p>
              A folha apresenta o salário bruto, os descontos de INSS e imposto
              de renda e o valor líquido a receber.
            </p>
            <p>Todos os valores seguem as regras configuradas no sistema.</p>
            <span className="help-decoration" aria-hidden="true">
              ↗
            </span>
          </aside>
        </div>
      )}
      {acao && (
        <p className="visually-spaced" role="status">
          {acao === 'simular' ? 'Calculando simulação…' : 'Salvando folha…'}
        </p>
      )}
      {simulacao && <ValoresFolha folha={simulacao} simulacao />}
    </>
  )
}
