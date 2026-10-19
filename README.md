# Folha de pagamento

API didática em Java 17, Spring Boot 3.5 e Maven 3.6.3 ou superior. Os dados ficam em memória e são perdidos ao encerrar a aplicação.

## Executar

```sh
mvn spring-boot:run
```

A API estará em `http://localhost:8080`. Para compilar e gerar o JAR:

```sh
mvn "-Dmaven.test.skip=true" package
java -jar target/folha-pagamento-0.0.1-SNAPSHOT.jar
```

Se o Java no Windows apresentar `Unable to establish loopback connection`, use um diretório temporário local para os sockets. Após gerar o JAR, execute no PowerShell:

```powershell
$diretorioSockets = (Resolve-Path target).Path
java "-Djdk.net.unixdomain.tmpdir=$diretorioSockets" -jar target/folha-pagamento-0.0.1-SNAPSHOT.jar
```

## Exemplos HTTP

Cadastre um funcionário:

```http
POST http://localhost:8080/funcionarios
Content-Type: application/json

{
  "nome": "Ana Silva",
  "cargo": "Analista de RH",
  "salarioBase": 3000.00
}
```

Gere uma folha para o mês completo (período no formato `AAAA-MM`):

```http
POST http://localhost:8080/folhas-pagamento
Content-Type: application/json

{
  "funcionarioId": 1,
  "periodo": "2026-10"
}
```

O exemplo retorna bruto de `3000.00`, INSS de `300.00`, IR de `35.00` e líquido de `2665.00`.

Outras operações (caminhos relativos a `http://localhost:8080`):

| Método e caminho | Operação |
| --- | --- |
| `GET /funcionarios` | Listar funcionários |
| `GET /funcionarios/1` | Consultar funcionário |
| `PUT /funcionarios/1` | Editar, usando o mesmo JSON do cadastro |
| `DELETE /funcionarios/1` | Excluir funcionário |
| `PATCH /funcionarios/1/salario?percentual=10` | Aumentar o salário em 10% |
| `GET /funcionarios/cargo/Analista` | Filtrar por cargo, sem diferenciar maiúsculas e minúsculas |
| `GET /funcionarios/salario-abaixo-de/4000` | Buscar salários estritamente menores que o limite |
| `POST /folhas-pagamento/simulacao` | Calcular sem salvar, usando o mesmo JSON da geração |
| `GET /folhas-pagamento/1` | Consultar folha |
| `GET /folhas-pagamento/funcionario/1` | Consultar folhas de um funcionário existente |
| `GET /folhas-pagamento/periodo/2026-10` | Consultar folhas de um mês |
| `GET /folhas-pagamento/periodo/2026-10/total-liquido` | Somar os líquidos do mês; retorna zero se não houver folhas |

Cadastros e gerações retornam `201` com `Location`; exclusões retornam `204`. Dados inválidos retornam `400` e recursos consultados por identificador que não existem retornam `404`. O identificador do funcionário é gerado no cadastro e definido pelo caminho na edição.

## Organização e regras

- `controller`: recebe HTTP, chama os serviços e trata erros.
- `service`: dois serviços, com validações e regras de funcionários e folhas.
- `repository`: contratos de armazenamento; `repository.memory` contém as implementações em memória.
- `model`: registros imutáveis, usados diretamente nas entradas e respostas.
- `dto`: apenas a entrada da geração/simulação, com funcionário e período.

Nome e cargo são obrigatórios; o salário-base deve ser de pelo menos R$ 0,01 e o percentual de reajuste deve ser positivo. Valores usam `BigDecimal`, duas casas decimais e arredondamento `HALF_UP`.

O bruto equivale ao salário-base mensal. O INSS é 10% do bruto. O IR é 5% da parcela que exceder R$ 2.000,00 após o INSS. O líquido é o bruto menos os dois descontos. Essas regras são fictícias e os valores podem ser alterados pelas variáveis de ambiente `FOLHA_ALIQUOTA_INSS` (padrão `0.10`), `FOLHA_ALIQUOTA_IR` (padrão `0.05`) e `FOLHA_ISENCAO_IR` (padrão `2000.00`). Cada geração cria um registro, inclusive para o mesmo funcionário e período. Alterar ou excluir o funcionário preserva as folhas já geradas.

## Preparação para mocks

Todas as dependências são recebidas por construtor. Os serviços podem ser instanciados diretamente, sem iniciar o Spring:

- `FuncionarioService`: substituir `FuncionarioRepository` por um mock.
- `FolhaPagamentoService`: substituir `FuncionarioService` e `FolhaPagamentoRepository` por mocks.
- Controllers: substituir o respectivo serviço por um mock.

Os métodos permitem verificar cadastro inválido sem gravação, edição/exclusão de registro inexistente, reajuste, filtros, geração com gravação, simulação sem gravação e totais mensais. Os cálculos de bruto, INSS, IR, total de descontos e líquido são métodos públicos do serviço de folha. Esta etapa não contém testes, stubs, spies nem dependências de testes.
