import type { Folha, Funcionario } from '../../src/api/client'
import { brl, unico } from '../support/commands'

describe('Navegação', () => {
  beforeEach(() => {
    cy.criarFuncionario({ nome: `Mateus ${unico()}`, salarioBase: 5300 }).as(
      'funcionario',
    )
    cy.periodoLivre()
      .then((periodo) =>
        cy
          .get<Funcionario>('@funcionario')
          .then((pessoa) => cy.gerarFolha(pessoa.id, periodo)),
      )
      .as('folha')
  })

  it('acessa as três telas pelo menu', () => {
    cy.visit('/')
    cy.get('[data-cy="menu-folhas"]').click()
    cy.location('pathname').should('equal', '/folhas')
    cy.get('[data-cy="menu-gerar"]').click()
    cy.location('pathname').should('equal', '/folhas/nova')
    cy.get('[data-cy="selecionar-funcionario"]').should('be.enabled')
    cy.get('[data-cy="menu-funcionarios"]').click()
    cy.location('pathname').should('equal', '/funcionarios')
    cy.get('[data-cy="tabela-funcionarios"]').should('be.visible')
  })

  it('abre e recarrega o detalhe de uma folha por rota profunda', () => {
    cy.get<Folha>('@folha').then((folha) => {
      cy.visit(`/folhas/${folha.id}`)
      cy.get('[data-cy="valor-liquido"]').should(
        'have.text',
        brl(folha.salarioLiquido),
      )
      cy.reload()
      cy.get('[data-cy="valor-liquido"]').should(
        'have.text',
        brl(folha.salarioLiquido),
      )
    })
  })

  it('recarrega a edição de funcionário sem confundir HTML com a API', () => {
    cy.get<Funcionario>('@funcionario').then((pessoa) => {
      cy.visit(`/funcionarios/${pessoa.id}/editar`)
      cy.get('[data-cy="nome"]').should('have.value', pessoa.nome)
      cy.reload()
      cy.get('[data-cy="nome"]').should('have.value', pessoa.nome)
    })
  })

  it('mantém o fluxo principal utilizável em uma tela pequena', () => {
    cy.viewport(390, 844)
    cy.visit('/folhas/nova')
    cy.get('[data-cy="selecionar-funcionario"]').should('be.visible')
    cy.get('[data-cy="periodo"]').should('be.visible')
    cy.get('[data-cy="gerar-folha"]').should('be.visible')
    cy.window().then((janela) =>
      expect(janela.document.documentElement.scrollWidth).to.equal(
        janela.document.documentElement.clientWidth,
      ),
    )
  })
})
