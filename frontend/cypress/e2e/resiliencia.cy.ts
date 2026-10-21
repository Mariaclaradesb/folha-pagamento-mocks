describe('Resiliência', () => {
  it('exibe o detail de uma falha 500 e permite tentar novamente', () => {
    // Este é o único cenário que substitui uma resposta da API.
    cy.intercept('GET', '/funcionarios', (requisicao) => {
      if (requisicao.headers.accept === 'application/json') {
        requisicao.reply({
          statusCode: 500,
          headers: { 'content-type': 'application/problem+json' },
          body: {
            status: 500,
            title: 'Internal Server Error',
            detail: 'Serviço temporariamente indisponível. Tente novamente.',
          },
        })
      } else requisicao.continue()
    }).as('falha')
    cy.visit('/funcionarios')
    cy.get('[data-cy="mensagem-erro"]').should(
      'have.text',
      'Serviço temporariamente indisponível. Tente novamente.×',
    )
    cy.get('[data-cy="mensagem-erro"]').should('have.attr', 'role', 'alert')
    cy.get('[data-cy="tentar-novamente"]')
      .should('be.visible')
      .and('be.enabled')
    cy.intercept('GET', '/funcionarios', (requisicao) =>
      requisicao.continue(),
    ).as('recuperado')
    cy.get('[data-cy="tentar-novamente"]').click()
    cy.get('[data-cy="carregando"]').should('not.exist')
    cy.get('[data-cy="tentar-novamente"]').should('not.exist')
    cy.get('[data-cy="mensagem-erro"]').should('not.exist')
  })
})
