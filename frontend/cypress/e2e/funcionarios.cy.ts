import type { Funcionario } from '../../src/api/client'
import { brl, unico } from '../support/commands'

describe('Funcionários', () => {
  beforeEach(() => {
    cy.criarFuncionario({ nome: `Mateus ${unico()}`, salarioBase: 5000 }).as(
      'funcionario',
    )
  })

  it('cadastra e exibe na lista', () => {
    const nome = `Maria Clara ${unico()}`
    const cargo = `Analista ${unico()}`
    cy.visit('/funcionarios')
    cy.get('[data-cy="novo-funcionario"]').click()
    cy.get('[data-cy="nome"]').type(nome)
    cy.get('[data-cy="cargo"]').type(cargo)
    cy.get('[data-cy="salario"]').type('5600')
    cy.intercept('POST', '/funcionarios').as('cadastro')
    cy.get('[data-cy="salvar-funcionario"]').click()
    cy.wait('@cadastro').then(({ response }) => {
      expect(response?.statusCode).to.equal(201)
      const pessoa = response?.body as Funcionario
      cy.get(`[data-cy="funcionario-${pessoa.id}"]`).within(() => {
        cy.get('[data-cy="funcionario-nome"]').should('have.text', nome)
        cy.get('[data-cy="funcionario-salario"]').should('have.text', brl(5600))
      })
    })
    cy.get('[data-cy="mensagem-sucesso"]').should('be.visible')
  })

  it('mostra o detail real do 400 quando o nome está vazio', () => {
    cy.visit('/funcionarios/novo')
    cy.get('[data-cy="cargo"]').type('Analista')
    cy.get('[data-cy="salario"]').type('5500')
    cy.intercept('POST', '/funcionarios').as('invalido')
    cy.get('[data-cy="salvar-funcionario"]').click()
    cy.wait('@invalido').then(({ response }) => {
      expect(response?.statusCode).to.equal(400)
      cy.get('[data-cy="erro-formulario"]').should(
        'have.text',
        (response?.body as { detail: string }).detail,
      )
    })
    cy.get('[data-cy="salvar-funcionario"]').should('be.enabled')
  })

  it('edita um funcionário', () => {
    cy.get<Funcionario>('@funcionario').then((pessoa) => {
      const nome = `Bruna ${unico()}`
      cy.visit('/funcionarios')
      cy.get(
        `[data-cy="funcionario-${pessoa.id}"] [data-cy="editar-funcionario"]`,
      ).click()
      cy.get('[data-cy="nome"]').clear().type(nome)
      cy.get('[data-cy="salario"]').clear().type('5900')
      cy.get('[data-cy="salvar-funcionario"]').click()
      cy.get(`[data-cy="funcionario-${pessoa.id}"]`).within(() => {
        cy.get('[data-cy="funcionario-nome"]').should('have.text', nome)
        cy.get('[data-cy="funcionario-salario"]').should('have.text', brl(5900))
      })
      cy.request<Funcionario>(`/funcionarios/${pessoa.id}`)
        .its('body.nome')
        .should('equal', nome)
    })
  })

  it('exclui um funcionário sem folhas após confirmação', () => {
    cy.get<Funcionario>('@funcionario').then((pessoa) => {
      cy.visit('/funcionarios')
      cy.get(
        `[data-cy="funcionario-${pessoa.id}"] [data-cy="excluir-funcionario"]`,
      ).click()
      cy.get('[data-cy="confirmar-dialogo"]').click()
      cy.get('[data-cy="mensagem-sucesso"]').should('be.visible')
      cy.get(`[data-cy="funcionario-${pessoa.id}"]`).should('not.exist')
      cy.request({ url: `/funcionarios/${pessoa.id}`, failOnStatusCode: false })
        .its('status')
        .should('equal', 404)
    })
  })

  it('filtra por cargo sem diferenciar maiúsculas e limpa os filtros', () => {
    cy.get<Funcionario>('@funcionario').then((pessoa) => {
      cy.visit('/funcionarios')
      cy.get('[data-cy="filtro-cargo"]').type(pessoa.cargo.toUpperCase())
      cy.get('[data-cy="aplicar-filtros"]').click()
      cy.get('[data-cy="tabela-funcionarios"] tbody tr').should(
        'have.length',
        1,
      )
      cy.get(`[data-cy="funcionario-${pessoa.id}"]`).should('exist')
      cy.get('[data-cy="limpar-filtros"]').click()
      cy.get('[data-cy="filtro-cargo"]').should('have.value', '')
      cy.get(`[data-cy="funcionario-${pessoa.id}"]`).should('exist')
    })
  })

  it('filtra salários estritamente abaixo do limite', () => {
    cy.criarFuncionario({ nome: `Bruna ${unico()}`, salarioBase: 5500 }).then(
      (noLimite) => {
        cy.get<Funcionario>('@funcionario').then((abaixo) => {
          cy.visit('/funcionarios')
          cy.get('[data-cy="filtro-salario"]').type('5500')
          cy.get('[data-cy="aplicar-filtros"]').click()
          cy.get(`[data-cy="funcionario-${abaixo.id}"]`).should('exist')
          cy.get(`[data-cy="funcionario-${noLimite.id}"]`).should('not.exist')
        })
      },
    )
  })

  it('reajusta em 10% de 5000 para 5500', () => {
    cy.get<Funcionario>('@funcionario').then((pessoa) => {
      cy.visit('/funcionarios')
      cy.get(
        `[data-cy="funcionario-${pessoa.id}"] [data-cy="reajustar-funcionario"]`,
      ).click()
      cy.get('[data-cy="percentual-reajuste"]').type('10')
      cy.get('[data-cy="previa-salario"]').should('have.text', brl(5500))
      cy.get('[data-cy="confirmar-dialogo"]').click()
      cy.get(
        `[data-cy="funcionario-${pessoa.id}"] [data-cy="funcionario-salario"]`,
      ).should('have.text', brl(5500))
      cy.request<Funcionario>(`/funcionarios/${pessoa.id}`)
        .its('body.salarioBase')
        .should('equal', 5500)
    })
  })
})
