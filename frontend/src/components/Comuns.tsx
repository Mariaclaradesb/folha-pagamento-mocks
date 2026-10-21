import { useEffect, useRef, type ReactNode } from 'react'
import { exibirPeriodo, moeda, type Folha } from '../api/client'
import { useAvisos } from './Layout'

export function Cabecalho({
  etiqueta,
  titulo,
  descricao,
  children,
}: {
  etiqueta: string
  titulo: string
  descricao: string
  children?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{etiqueta}</p>
        <h1>{titulo}</h1>
        <p className="muted">{descricao}</p>
      </div>
      {children}
    </div>
  )
}

export function Carregando() {
  return (
    <div className="empty-state" role="status" data-cy="carregando">
      <span className="spinner" />
      Carregando dados…
    </div>
  )
}
export function Vazio({ children }: { children: ReactNode }) {
  return (
    <div className="empty-state" data-cy="estado-vazio">
      <span className="empty-icon" aria-hidden="true">
        ▤
      </span>
      {children}
    </div>
  )
}
export function Falha({ tentar }: { tentar: () => void }) {
  const avisar = useAvisos()
  return (
    <div className="empty-state">
      <p>Não foi possível carregar os dados.</p>
      <button
        className="button secondary"
        onClick={() => {
          avisar(null)
          tentar()
        }}
        data-cy="tentar-novamente"
      >
        Tentar novamente
      </button>
    </div>
  )
}

export function Modal({
  titulo,
  children,
  fechar,
  ocupado,
}: {
  titulo: string
  children: ReactNode
  fechar: () => void
  ocupado: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  return (
    <dialog
      ref={dialog}
      aria-labelledby="titulo-dialogo"
      onCancel={(event) => {
        event.preventDefault()
        if (!ocupado) fechar()
      }}
    >
      <div className="dialog-heading">
        <h2 id="titulo-dialogo">{titulo}</h2>
        <button
          className="icon-button"
          type="button"
          onClick={fechar}
          disabled={ocupado}
          aria-label="Fechar diálogo"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  )
}

export function ValoresFolha({
  folha,
  simulacao = false,
}: {
  folha: Folha
  simulacao?: boolean
}) {
  return (
    <section
      className="card payroll-result"
      data-cy="resultado-folha"
      aria-label={simulacao ? 'Resultado da simulação' : 'Valores da folha'}
    >
      <div className="card-heading">
        <div>
          <p className="eyebrow">
            {simulacao ? 'PRÉVIA DO PAGAMENTO' : `FOLHA #${folha.id}`}
          </p>
          <h2>{folha.funcionario.nome}</h2>
          <p className="muted">
            {folha.funcionario.cargo} · {exibirPeriodo(folha.periodo)}
          </p>
        </div>
        <span
          className={`badge ${simulacao ? 'neutral' : ''}`}
          data-cy="situacao-folha"
        >
          {simulacao ? 'Simulação · não salva' : 'Gerada'}
        </span>
      </div>
      <dl className="payroll-values">
        <div>
          <dt>Salário bruto</dt>
          <dd data-cy="valor-bruto">{moeda(folha.salarioBruto)}</dd>
        </div>
        <div>
          <dt>Desconto INSS</dt>
          <dd data-cy="valor-inss">{moeda(folha.descontoInss)}</dd>
        </div>
        <div>
          <dt>Imposto de renda</dt>
          <dd data-cy="valor-ir">{moeda(folha.descontoImpostoRenda)}</dd>
        </div>
        <div className="net-value">
          <dt>Salário líquido</dt>
          <dd data-cy="valor-liquido">{moeda(folha.salarioLiquido)}</dd>
        </div>
      </dl>
      <p className="footnote">
        Valores calculados pelo sistema de folha de pagamento.
      </p>
    </section>
  )
}
