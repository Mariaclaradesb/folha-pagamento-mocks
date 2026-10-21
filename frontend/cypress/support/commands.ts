import type { Folha, Funcionario } from '../../src/api/client'

export const unico = () => crypto.randomUUID().replaceAll('-', '').slice(0, 12)
export const brl = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    valor,
  )

Cypress.Commands.add('criarFuncionario', (dados = {}) =>
  cy
    .request<Funcionario>({
      method: 'POST',
      url: '/funcionarios',
      body: {
        nome: `Mateus ${unico()}`,
        cargo: `Analista ${unico()}`,
        salarioBase: 5000,
        ...dados,
      },
    })
    .then((resposta) => {
      expect(resposta.status).to.equal(201)
      return cy.get<number[]>('@idsFuncionariosDoTeste').then((ids) => {
        ids.push(resposta.body.id)
        return resposta.body
      })
    }),
)

Cypress.Commands.add('gerarFolha', (funcionarioId, periodo) =>
  cy
    .request<Folha>('POST', '/folhas-pagamento', { funcionarioId, periodo })
    .then((resposta) => {
      expect(resposta.status).to.equal(201)
      return resposta.body
    }),
)

Cypress.Commands.add('periodoLivre', () => {
  const periodo = `${3000 + Math.floor(Math.random() * 7000)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}`
  // Confere a disponibilidade para não depender nem da probabilidade de colisão.
  return cy
    .request<Folha[]>(`/folhas-pagamento/periodo/${periodo}`)
    .then((resposta): Cypress.Chainable<string> =>
      resposta.body.length === 0
        ? cy.wrap(periodo, { log: false })
        : cy.periodoLivre(),
    )
})
