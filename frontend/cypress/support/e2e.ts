import './commands'
import type { Folha, Funcionario } from '../../src/api/client'
import { normalizarFuncionarioTeste } from '../../scripts/dados-teste.mjs'

beforeEach(() => {
  // O registro pertence ao teste e sobrevive à recarga da janela da aplicação.
  const erros: string[] = []
  const idsFuncionarios: number[] = []
  cy.wrap(idsFuncionarios, { log: false }).as('idsFuncionariosDoTeste')
  // Observa cadastros feitos pela interface; cy.request é registrado no comando customizado.
  cy.intercept(
    { method: 'POST', pathname: '/funcionarios', middleware: true },
    (requisicao) => {
      requisicao.on('response', (resposta) => {
        const funcionario = resposta.body as Funcionario
        if (resposta.statusCode === 201 && typeof funcionario.id === 'number')
          idsFuncionarios.push(funcionario.id)
      })
    },
  )
  cy.on('window:before:load', (janela) => {
    cy.stub(janela.console, 'error').callsFake((...argumentos: unknown[]) => {
      erros.push(argumentos.map(String).join(' '))
    })
  })
  cy.wrap(erros, { log: false }).as('errosConsole')
})

afterEach(() => {
  cy.get<number[]>('@idsFuncionariosDoTeste').then((ids) => {
    for (const id of new Set(ids)) {
      cy.request<Funcionario>({
        url: `/funcionarios/${id}`,
        failOnStatusCode: false,
      }).then((resposta) => {
        if (resposta.status === 404) return
        expect(resposta.status).to.equal(200)
        const dados = normalizarFuncionarioTeste(resposta.body)
        expect(
          dados,
          'somente o cadastro criado pelo próprio teste é limpo',
        ).not.to.equal(null)
        if (!dados) return
        cy.request<Folha[]>(`/folhas-pagamento/funcionario/${id}`).then(
          ({ body: folhas }) => {
            if (folhas.length === 0) {
              cy.request('DELETE', `/funcionarios/${id}`)
                .its('status')
                .should('equal', 204)
            } else {
              // A API preserva folhas: apenas retira os identificadores do nome e cargo.
              cy.request<Funcionario>('PUT', `/funcionarios/${id}`, dados)
                .its('body')
                .should('include', dados)
            }
          },
        )
      })
    }
  })
  cy.get<string[]>('@errosConsole').then((erros) => {
    expect(erros, 'nenhum erro no console do navegador').to.deep.equal([])
  })
})
