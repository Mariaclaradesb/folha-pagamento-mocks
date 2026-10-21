import { useCallback, useEffect, useState } from 'react'
import { mensagemErro, solicitar } from '../api/client'
import { useAvisos } from '../components/Layout'

export function useRecurso<T>(caminho: string | null) {
  const [dados, setDados] = useState<T | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [versao, setVersao] = useState(0)
  const avisar = useAvisos()
  const recarregar = useCallback(() => setVersao((valor) => valor + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    setCarregando(true)
    setErro('')
    setDados(null)
    if (!caminho) {
      setCarregando(false)
      return () => controller.abort()
    }
    solicitar<T>(caminho, { signal: controller.signal })
      .then((resultado) => {
        if (!controller.signal.aborted) setDados(resultado)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setErro(mensagemErro(error))
          avisar({ tipo: 'erro', mensagem: mensagemErro(error) })
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false)
      })
    return () => controller.abort()
  }, [caminho, versao, avisar])
  return { dados, carregando, erro, recarregar }
}
