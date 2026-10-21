Projeto referente a atividade 1 da disciplina Teste Automático de Software.

## Frontend

Aplicação React 18, Vite e TypeScript em `frontend/`, com navegação pelo React Router, CSS responsivo e testes e2e contra a API real. Requer Java 17, Maven e Node.js 22.12 ou superior (recomendado: Node.js 22 LTS).

Na raiz do repositório, inicie o backend na porta 8080:

```sh
mvn spring-boot:run
```

Neste Windows, a execução pelo ambiente isolado encontrou `Unable to establish loopback connection` no Java 17. Se isso ocorrer, use uma pasta temporária de sockets dentro de `target/`, sem modificar o backend (PowerShell):

```powershell
New-Item -ItemType Directory -Force target/java-sockets | Out-Null
mvn '-Dspring-boot.run.jvmArguments=-Djdk.net.unixdomain.tmpdir=target/java-sockets' spring-boot:run
```

Em outro terminal, instale as dependências e inicie o frontend na porta 5173:

```sh
cd frontend
npm ci
npm run dev
```

Abra http://localhost:5173. O proxy do Vite encaminha chamadas JSON de `/funcionarios` e `/folhas-pagamento` para a porta 8080. Navegações HTML recebem a SPA, inclusive ao recarregar `/funcionarios/:id/editar` ou `/folhas/:id`. O navegador usa apenas caminhos relativos; não é necessário configurar CORS.

Rotas: `/funcionarios` (cadastro, edição, exclusão, reajuste e filtros), `/folhas/nova` (simular e gerar), `/folhas` (consultar por funcionário ou período e ver total líquido) e `/folhas/:id` (detalhe). Cargo usa correspondência exata sem diferenciar maiúsculas; salário abaixo de usa limite exclusivo. Se ambos os filtros estiverem preenchidos, a busca por cargo vem da API e o limite restringe essa lista.

Os erros exibem o `detail` recebido da API. Nome e cargo são validados pelo servidor, enquanto salário, percentual e período recebem validação básica no formulário. A prévia do reajuste é informativa; valores definitivos e todos os descontos das folhas vêm do backend. Cada clique concluído em Gerar cria um registro novo, mesmo para a mesma pessoa e mês. Simular não salva.

### Verificações e testes

Com os dois servidores no ar, em `frontend/`:

```sh
npm run build
npm run lint
npm run cypress:run
npm run cypress:run
```

Para abrir o Cypress interativo: `npm run cypress:open`.

Para iniciar automaticamente **apenas o frontend**, aguardar sua disponibilidade, executar o Cypress e encerrar o frontend ao terminar:

```sh
npm run e2e
```

O backend deve estar iniciado antes. `e2e` verifica `http://localhost:8080/funcionarios` e falha com uma mensagem explicativa se não estiver disponível. Deixe a porta 5173 livre para esse comando. O `start-server-and-test` espera o frontend antes de executar os testes.

Os testes ficam em `frontend/cypress/e2e/`, usam seletores `data-cy`, comandos tipados `cy.criarFuncionario`, `cy.gerarFolha` e `cy.periodoLivre`, e não precisam de banco limpo nem de IDs fixos. Cada cenário cria seus próprios dados; os períodos futuros são conferidos pela API antes do uso. Apenas `resiliencia.cy.ts` substitui respostas; as demais interceptações apenas observam chamadas reais. Erros de `console.error` e exceções não tratadas fazem os testes falharem.

O H2 guarda os dados somente enquanto o backend está rodando. Reiniciá-lo remove todos os cadastros e folhas. Ao fim de cada teste, a suíte exclui somente os funcionários que ela própria criou e que não possuem folhas. Quando há folhas vinculadas, preserva esses registros e remove os identificadores de teste do nome e do cargo. Os identificadores únicos são usados durante o teste e não ficam na interface após sua conclusão. A suíte pode ser repetida sem reiniciar o servidor.

Para limpar registros antigos da suíte, execute em `frontend/`: `node scripts/limpar-dados-testes.mjs --aplicar`. O script reconhece o padrão de nome e cargo dos dados de teste, salva uma cópia em `frontend/.dados-locais/` (ignorada pelo Git), exclui apenas funcionários de teste sem folhas e normaliza os nomes dos demais. Cadastros comuns e folhas são preservados. Sem `--aplicar`, apenas informa a quantidade encontrada.

Os resultados da execução inicial estão em [frontend/VALIDACAO.md](frontend/VALIDACAO.md).

`npm run build` gera `frontend/dist/`. Para hospedar esse conteúdo em produção, configure no servidor web o fallback HTML das rotas da SPA e o encaminhamento das chamadas da API, distinguindo navegação HTML de JSON; o proxy de desenvolvimento do Vite não é incorporado ao build. Nenhuma alteração no backend é necessária para desenvolvimento ou testes.
