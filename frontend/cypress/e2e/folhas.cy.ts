import type { Folha, Funcionario } from '../../src/api/client'
import { brl, unico } from '../support/commands'

describe('Folhas de pagamento', () => {
  beforeEach(() => {
    cy.criarFuncionario({
      nome: `Maria Clara ${unico()}`,
      salarioBase: 5800,
    }).as('funcionario')
    cy.periodoLivre().as('periodo')
  })

  it('simula sem persistir e a consulta por funcionário permanece vazia', () => {
    cy.get<Funcionario>('@funcionario').then((pessoa) => {
      cy.get<string>('@periodo').then((periodo) => {
        cy.visit('/folhas/nova')
        cy.get('[data-cy="selecionar-funcionario"]').select(String(pessoa.id))
        cy.get('[data-cy="periodo"]').type(periodo)
        cy.get('[data-cy="simular-folha"]').click()
        cy.get('[data-cy="situacao-folha"]').should(
          'have.text',
          'Simulação · não salva',
        )
        cy.request<Folha[]>(`/folhas-pagamento/funcionario/${pessoa.id}`)
          .its('body')
          .should('deep.equal', [])
        cy.get('[data-cy="menu-folhas"]').click()
        cy.get('[data-cy="consulta-funcionario"]').select(String(pessoa.id))
        cy.get('[data-cy="consultar-folhas"]').click()
        cy.get('[data-cy="estado-vazio"]').should('be.visible')
        cy.get('[data-cy="tabela-folhas"]').should('not.exist')
      })
    })
  })

  it('gera e mostra os quatro valores retornados pela API, sem recalculá-los', () => {
    cy.get<Funcionario>('@funcionario').then((pessoa) => {
      cy.get<string>('@periodo').then((periodo) => {
        cy.visit('/folhas/nova')
        cy.get('[data-cy="selecionar-funcionario"]').select(String(pessoa.id))
        cy.get('[data-cy="periodo"]').type(periodo)
        cy.get('[data-cy="gerar-folha"]').click()
        cy.location('pathname')
          .should('match', /^\/folhas\/\d+$/)
          .then((caminho) => {
            cy.request<Folha>(
              `/folhas-pagamento/${caminho.split('/').pop()}`,
            ).then(({ body }) => {
              cy.get('[data-cy="valor-bruto"]').should(
                'have.text',
                brl(body.salarioBruto),
              )
              cy.get('[data-cy="valor-inss"]').should(
                'have.text',
                brl(body.descontoInss),
              )
              cy.get('[data-cy="valor-ir"]').should(
                'have.text',
                brl(body.descontoImpostoRenda),
              )
              cy.get('[data-cy="valor-liquido"]').should(
                'have.text',
                brl(body.salarioLiquido),
              )
              expect(body.funcionario.id).to.equal(pessoa.id)
              expect(body.periodo).to.equal(periodo)
            })
          })
      })
    })
  })

  it('consulta por período e mostra o total líquido como soma das folhas desse mês', () => {
    cy.get<Funcionario>('@funcionario').then((pessoa) => {
      cy.get<string>('@periodo').then((periodo) => {
        cy.gerarFolha(pessoa.id, periodo).as('primeira')
        cy.criarFuncionario({ nome: `Bruna ${unico()}`, salarioBase: 6000 })
          .then((outra) => cy.gerarFolha(outra.id, periodo))
          .as('segunda')
        cy.visit('/folhas')
        cy.get('[data-cy="modo-periodo"]')
          .should('be.enabled')
          .check()
          .should('be.checked')
        cy.get('[data-cy="consulta-periodo"]').type(periodo)
        cy.get('[data-cy="consultar-folhas"]').click()
        cy.get<Folha>('@primeira').then((folha) =>
          cy.get(`[data-cy="folha-${folha.id}"]`).should('be.visible'),
        )
        cy.get<Folha>('@segunda').then((folha) =>
          cy.get(`[data-cy="folha-${folha.id}"]`).should('be.visible'),
        )
        cy.request<Folha[]>(`/folhas-pagamento/periodo/${periodo}`).then(
          ({ body }) => {
            expect(body).to.have.length(2)
            const totalCentavos = body.reduce(
              (soma, folha) => soma + Math.round(folha.salarioLiquido * 100),
              0,
            )
            cy.request<number>(
              `/folhas-pagamento/periodo/${periodo}/total-liquido`,
            )
              .its('body')
              .should('equal', totalCentavos / 100)
            cy.get('[data-cy="total-liquido"]').should(
              'have.text',
              brl(totalCentavos / 100),
            )
          },
        )
      })
    })
  })

  it('consulta um mês vazio e mostra total zero', () => {
    cy.get<string>('@periodo').then((periodo) => {
      cy.visit('/folhas')
      cy.get('[data-cy="modo-periodo"]')
        .should('be.enabled')
        .check()
        .should('be.checked')
      cy.get('[data-cy="consulta-periodo"]').type(periodo)
      cy.get('[data-cy="consultar-folhas"]').click()
      cy.get('[data-cy="estado-vazio"]').should('be.visible')
      cy.get('[data-cy="total-liquido"]').should('have.text', brl(0))
    })
  })

  it('bloqueia período vazio e permite corrigir sem criar folha', () => {
    cy.get<Funcionario>('@funcionario').then((pessoa) => {
      cy.visit('/folhas/nova')
      cy.get('[data-cy="selecionar-funcionario"]').select(String(pessoa.id))
      cy.get('[data-cy="gerar-folha"]').click()
      cy.get('[data-cy="erro-formulario"]').should('be.visible')
      cy.get('[data-cy="simular-folha"]').click()
      cy.get('[data-cy="erro-formulario"]').should('be.visible')
      cy.request<Folha[]>(`/folhas-pagamento/funcionario/${pessoa.id}`)
        .its('body')
        .should('deep.equal', [])
      cy.location('pathname').should('equal', '/folhas/nova')
    })
  })
})
