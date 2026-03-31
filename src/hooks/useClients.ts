import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface Client {
  id: string
  name: string
  email: string | null
  description: string | null
  image_url: string | null
  logo_url: string | null
  sort_order: number
  tier: string
  module_overrides: Record<string, boolean>
  created_at: string
  updated_at: string
}

export function useClients() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClients = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, email, description, image_url, logo_url, sort_order, tier, module_overrides, created_at, updated_at')
      .order('sort_order', { ascending: true })
    if (!error && data) setClients(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchClients()

    // Realtime subscription
    const channel = supabase
      .channel('client-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchClients()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchClients])

  const createClient = async (data: { name: string; email?: string; description?: string }) => {
    if (!user) throw new Error('Not authenticated')
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({ ...data, agency_id: user.id })
      .select()
      .single()
    if (error) throw error
    return newClient
  }

  const updateClient = async (id: string, data: Partial<Client>) => {
    const { error } = await supabase.from('clients').update(data).eq('id', id)
    if (error) throw error
  }

  const deleteClient = async (id: string) => {
    const { error } = await supabase.rpc('delete_client_with_data', { client_id_param: id })
    if (error) throw error
  }

  return { clients, loading, createClient, updateClient, deleteClient, refetch: fetchClients }
}
