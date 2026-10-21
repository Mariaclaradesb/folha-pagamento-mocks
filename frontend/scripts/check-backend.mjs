try {
  const response = await fetch('http://localhost:8080/funcionarios', {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok || !Array.isArray(await response.json()))
    throw new Error('Resposta inesperada')
  console.log('Backend disponível na porta 8080.')
} catch {
  console.error(
    'Backend indisponível: inicie "mvn spring-boot:run" na raiz do repositório (http://localhost:8080/funcionarios) antes de executar os testes.',
  )
  process.exitCode = 1
}
