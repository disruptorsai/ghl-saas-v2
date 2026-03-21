import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface CommunityMember {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  role_label: string | null
  company: string | null
  is_online: boolean
  joined_at: string
}

export function useCommunityMembers() {
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('community_members')
      .select('*')
      .order('joined_at', { ascending: false })
      .then(({ data }) => {
        setMembers(data || [])
        setLoading(false)
      })
  }, [])

  return { members, loading }
}
