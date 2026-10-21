// O reconhecimento exige nome e cargo usados pela suíte; cadastros comuns não entram.
const identificador =
  '(?:\\d{13}-[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}|[0-9a-f]{12})'
const nomeTeste = new RegExp(
  `^(Mateus|Maria Clara|Bruna) ${identificador}$`,
  'i',
)
const cargoTeste = new RegExp(`^Analista ${identificador}$`, 'i')

export function normalizarFuncionarioTeste(funcionario) {
  const nome = nomeTeste.exec(funcionario.nome)
  if (!nome || !cargoTeste.test(funcionario.cargo)) return null
  return {
    nome: nome[1],
    cargo: 'Analista',
    salarioBase: funcionario.salarioBase,
  }
}
