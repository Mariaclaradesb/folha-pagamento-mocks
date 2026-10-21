import type { Funcionario } from '../../src/api/client'
import { unico } from '../support/commands'

describe('Integridade dos cadastros', () => {
  beforeEach(() => {
    cy.criarFuncionario({ nome: `Bruna ${unico()}`, salarioBase: 5500 }).as(
      'funcionario',
    )
    cy.periodoLivre().then((periodo) =>
      cy
        .get<Funcionario>('@funcionario')
        .then((pessoa) => cy.gerarFolha(pessoa.id, periodo)),
    )
  })

  it('exibe o detail do 409 e mantém o funcionário e o diálogo', () => {
    cy.get<Funcionario>('@funcionario').then((pessoa) => {
      cy.visit('/funcionarios')
      cy.intercept('DELETE', `/funcionarios/${pessoa.id}`).as('exclusao')
      cy.get(
        `[data-cy="funcionario-${pessoa.id}"] [data-cy="excluir-funcionario"]`,
      ).click()
      cy.get('[data-cy="confirmar-dialogo"]').click()
      cy.wait('@exclusao').then(({ response }) => {
        expect(response?.statusCode).to.equal(409)
        cy.get('[data-cy="erro-dialogo"]').should(
          'have.text',
          (response?.body as { detail: string }).detail,
        )
      })
      cy.get('[data-cy="confirmar-dialogo"]')
        .should('be.visible')
        .and('be.enabled')
      cy.get('[data-cy="cancelar-dialogo"]').click()
      cy.get(`[data-cy="funcionario-${pessoa.id}"]`).should('be.visible')
      cy.request(`/funcionarios/${pessoa.id}`)
        .its('status')
        .should('equal', 200)
    })
  })
})
