import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { normalizarFuncionarioTeste } from './dados-teste.mjs'

async function api(caminho, options = {}) {
  const response = await fetch(`http://localhost:8080${caminho}`, {
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok)
    throw new Error(`Falha na API: HTTP ${response.status} em ${caminho}`)
  return response.status === 204 ? null : response.json()
}

try {
  const funcionarios = await api('/funcionarios')
  const candidatos = funcionarios.filter((pessoa) =>
    normalizarFuncionarioTeste(pessoa),
  )
  const registros = []
  for (const funcionario of funcionarios) {
    registros.push({
      funcionario,
      folhas: await api(`/folhas-pagamento/funcionario/${funcionario.id}`),
    })
  }
  console.log(
    `${candidatos.length} cadastros de teste identificados. Os demais serão preservados.`,
  )
  if (!process.argv.includes('--aplicar')) {
    console.log('Para aplicar a limpeza, execute novamente com --aplicar.')
  } else {
    const pasta = new URL('../.dados-locais/', import.meta.url)
    await mkdir(pasta, { recursive: true })
    const backup = new URL(`backup-${Date.now()}.json`, pasta)
    await writeFile(backup, JSON.stringify(registros, null, 2))
    console.log(`Cópia dos dados antes da limpeza: ${fileURLToPath(backup)}`)

    let excluidos = 0
    let normalizados = 0
    for (const candidato of candidatos) {
      // Relê antes de alterar para respeitar edições feitas desde a identificação.
      const atual = await api(`/funcionarios/${candidato.id}`)
      const dados = normalizarFuncionarioTeste(atual)
      if (!dados) continue
      const folhas = await api(`/folhas-pagamento/funcionario/${atual.id}`)
      if (folhas.length === 0) {
        await api(`/funcionarios/${atual.id}`, { method: 'DELETE' })
        excluidos++
      } else {
        await api(`/funcionarios/${atual.id}`, {
          method: 'PUT',
          body: JSON.stringify(dados),
        })
        normalizados++
      }
    }

    // Confere a preservação dos cadastros alheios à suíte e dos valores de todas as folhas.
    for (const registro of registros) {
      if (!normalizarFuncionarioTeste(registro.funcionario)) {
        const atual = await api(`/funcionarios/${registro.funcionario.id}`)
        if (JSON.stringify(atual) !== JSON.stringify(registro.funcionario))
          throw new Error('Um cadastro externo à suíte foi alterado.')
      }
      if (registro.folhas.length > 0) {
        const atuais = await api(
          `/folhas-pagamento/funcionario/${registro.funcionario.id}`,
        )
        const valores = (folhas) =>
          folhas.map((folha) => [
            folha.id,
            folha.periodo,
            folha.salarioBruto,
            folha.descontoInss,
            folha.descontoImpostoRenda,
            folha.salarioLiquido,
          ])
        if (
          JSON.stringify(valores(atuais)) !==
          JSON.stringify(valores(registro.folhas))
        )
          throw new Error(
            'Os registros de folhas não correspondem à cópia anterior.',
          )
      }
    }
    console.log(
      `Limpeza concluída: ${excluidos} cadastros de teste sem folhas excluídos; ${normalizados} cadastros com folhas tiveram nome e cargo normalizados. Demais cadastros e todas as folhas preservados.`,
    )
  }
} catch (erro) {
  console.error(erro instanceof Error ? erro.message : erro)
  process.exitCode = 1
}
