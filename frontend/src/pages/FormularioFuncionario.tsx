import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  mensagemErro,
  solicitar,
  type DadosFuncionario,
  type Funcionario,
} from '../api/client'
import { Cabecalho, Carregando, Falha } from '../components/Comuns'
import { useAvisos } from '../components/Layout'
import { useRecurso } from '../hooks/useRecurso'

export function FormularioFuncionario() {
  const { id } = useParams()
  return id ? <EditarFuncionario key={id} id={id} /> : <Formulario key="novo" />
}

function EditarFuncionario({ id }: { id: string }) {
  const { dados, carregando, erro, recarregar } = useRecurso<Funcionario>(
    `/funcionarios/${encodeURIComponent(id)}`,
  )
  if (carregando) return <Carregando />
  if (erro || !dados) return <Falha tentar={recarregar} />
  return <Formulario funcionario={dados} />
}

function Formulario({ funcionario }: { funcionario?: Funcionario }) {
  const [nome, setNome] = useState(funcionario?.nome ?? '')
  const [cargo, setCargo] = useState(funcionario?.cargo ?? '')
  const [salario, setSalario] = useState(
    funcionario?.salarioBase.toFixed(2) ?? '',
  )
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const avisar = useAvisos()
  const navigate = useNavigate()
  async function salvar(event: FormEvent) {
    event.preventDefault()
    if (ocupado) return
    setErro('')
    avisar(null)
    if (!Number.isFinite(Number(salario)) || Number(salario) < 0.01) {
      setErro('Salário-base deve ser de pelo menos R$ 0,01')
      return
    }
    setOcupado(true)
    // Nome e cargo são validados pela API para preservar o detail do contrato.
    const dados: DadosFuncionario = {
      nome: nome.trim(),
      cargo: cargo.trim(),
      salarioBase: Number(salario),
    }
    try {
      await solicitar<Funcionario>(
        funcionario ? `/funcionarios/${funcionario.id}` : '/funcionarios',
        { method: funcionario ? 'PUT' : 'POST', body: JSON.stringify(dados) },
      )
      avisar({
        tipo: 'sucesso',
        mensagem: funcionario
          ? 'Funcionário atualizado com sucesso.'
          : 'Funcionário cadastrado com sucesso.',
      })
      navigate('/funcionarios')
    } catch (error) {
      const mensagem = mensagemErro(error)
      setErro(mensagem)
      avisar({ tipo: 'erro', mensagem })
    } finally {
      setOcupado(false)
    }
  }
  return (
    <>
      <Link to="/funcionarios" className="back-link">
        ← Voltar para funcionários
      </Link>
      <Cabecalho
        etiqueta="GESTÃO DE PESSOAS"
        titulo={funcionario ? 'Editar funcionário' : 'Novo funcionário'}
        descricao="Mantenha os dados da sua equipe sempre em dia."
      />
      <section className="card form-card">
        <div className="card-heading">
          <div>
            <h2>Dados do funcionário</h2>
            <p className="muted">Todos os campos são obrigatórios.</p>
          </div>
        </div>
        <form
          onSubmit={(event) => void salvar(event)}
          noValidate
          className="form-body"
          data-cy="formulario-funcionario"
        >
          <fieldset disabled={ocupado}>
            <div className="field">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                data-cy="nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                autoComplete="name"
                placeholder="Ex.: Maria Clara"
                required
              />
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="cargo">Cargo</label>
                <input
                  id="cargo"
                  data-cy="cargo"
                  value={cargo}
                  onChange={(event) => setCargo(event.target.value)}
                  placeholder="Ex.: Analista de sistemas"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="salario">Salário-base (R$)</label>
                <input
                  id="salario"
                  data-cy="salario"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={salario}
                  onChange={(event) => setSalario(event.target.value)}
                  placeholder="Ex.: 5.500,00"
                  required
                  aria-describedby="ajuda-salario"
                />
                <small id="ajuda-salario">
                  Informe o valor bruto mensal, com até 2 casas decimais.
                </small>
              </div>
            </div>
          </fieldset>
          {erro && (
            <p className="inline-error" role="alert" data-cy="erro-formulario">
              {erro}
            </p>
          )}
          <div className="form-actions">
            <button
              className="button secondary"
              type="button"
              onClick={() => navigate('/funcionarios')}
              disabled={ocupado}
            >
              Cancelar
            </button>
            <button
              className="button"
              disabled={ocupado}
              data-cy="salvar-funcionario"
            >
              {ocupado
                ? 'Salvando…'
                : funcionario
                  ? 'Salvar alterações'
                  : 'Cadastrar funcionário'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}
