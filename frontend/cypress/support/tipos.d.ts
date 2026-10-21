import type { DadosFuncionario, Folha, Funcionario } from '../../src/api/client'

declare global {
  namespace Cypress {
    interface Chainable {
      criarFuncionario(
        dados?: Partial<DadosFuncionario>,
      ): Chainable<Funcionario>
      gerarFolha(funcionarioId: number, periodo: string): Chainable<Folha>
      periodoLivre(): Chainable<string>
    }
  }
}
