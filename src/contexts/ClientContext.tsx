import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useParams } from 'react-router-dom'

interface ClientContextType {
  activeClientId: string | null
}

const ClientContext = createContext<ClientContextType>({ activeClientId: null })

export function ClientProvider({ children }: { children: ReactNode }) {
  const { role, clientId: profileClientId } = useAuth()
  const { clientId: urlClientId } = useParams<{ clientId: string }>()

  // Client users: always use their assigned client
  // Agency users: use URL param (from client picker)
  const activeClientId = role === 'client' ? profileClientId : (urlClientId || null)

  return (
    <ClientContext.Provider value={{ activeClientId }}>
      {children}
    </ClientContext.Provider>
  )
}

export const useActiveClient = () => useContext(ClientContext)
