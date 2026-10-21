export interface Funcionario {
  id: number
  nome: string
  cargo: string
  salarioBase: number
}

export type DadosFuncionario = Omit<Funcionario, 'id'>

export interface Folha {
  id: number | null
  funcionario: Funcionario
  periodo: string
  salarioBruto: number
  descontoInss: number
  descontoImpostoRenda: number
  salarioLiquido: number
}

export class ErroApi extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ErroApi'
  }
}

export async function solicitar<T>(
  caminho: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(caminho, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error
    throw new ErroApi(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      0,
    )
  }
  if (!response.ok) {
    let mensagem = `Não foi possível concluir a operação (HTTP ${response.status}). Tente novamente.`
    try {
      const problema: unknown = await response.json()
      if (
        typeof problema === 'object' &&
        problema !== null &&
        'detail' in problema &&
        typeof problema.detail === 'string'
      )
        mensagem = problema.detail
    } catch {
      /* Respostas sem JSON também recebem uma mensagem legível. */
    }
    throw new ErroApi(mensagem, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const mensagemErro = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Ocorreu um erro inesperado. Tente novamente.'
export const moeda = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    valor,
  )
export const periodoValido = (valor: string) =>
  /^\d{4}-(0[1-9]|1[0-2])$/.test(valor) && Number(valor.slice(0, 4)) > 0
export const exibirPeriodo = (valor: string) =>
  `${valor.slice(5)}/${valor.slice(0, 4)}`
