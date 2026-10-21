# Validação do frontend

Executada em 20/10/2026, com o backend Spring Boot real na porta 8080 e o frontend Vite na porta 5173.

- `npm run build`: aprovado, incluindo TypeScript strict da aplicação, configuração e testes Cypress.
- `npm run lint`: aprovado, sem erros ou avisos.
- `npm run cypress:run`, primeira rodada final: 18 aprovados, zero falhas.
- `npm run cypress:run`, segunda rodada consecutiva: 18 aprovados, zero falhas.
- `npm run e2e`: 18 aprovados, zero falhas; verificação do backend, inicialização e espera pelo frontend concluídas.
- Verificação com backend desligado: `check:backend` falhou com código 1 e mensagem em português orientando a iniciar o Maven.

O backend não foi reiniciado nem o banco limpo entre as duas rodadas. Também havia registros de execuções anteriores e da validação manual. A suíte não usa tentativas automáticas para ocultar falhas (`retries: 0`).

| Área | Testes por rodada |
| --- | ---: |
| Funcionários | 7 |
| Folhas | 5 |
| Integridade | 1 |
| Navegação e responsividade | 4 |
| Resiliência | 1 |
| Total | 18 |

No navegador da aplicação, foram exercitados cadastro, listagem, simulação, geração e recarga do detalhe de uma folha. O console permaneceu sem erros ou avisos nesse fluxo. Todos os testes também verificam chamadas a `console.error` e mantêm a detecção padrão de exceções não tratadas do Cypress.

Ambiente: Node.js 22.17.1, Java 17.0.14, React 18.3.1, Vite 8.3.4 e Cypress 16.2.0, com Electron 146 em modo headless.

A execução do Java neste Windows exigiu configurar a pasta temporária de sockets em `target/java-sockets`. O comando alternativo está documentado no README da raiz. Nenhum arquivo do backend, `pom.xml` ou teste Java foi modificado. Não foram feitos commits nem push.
