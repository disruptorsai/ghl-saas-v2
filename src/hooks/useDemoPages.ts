import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface Section {
  id: string
  type: 'hero' | 'text' | 'form' | 'chat' | 'cta' | 'image' | 'video'
  title: string
  content: string
  settings: Record<string, unknown>
  order: number
}

export interface DemoPage {
  id: string
  slug: string
  title: string
  sections: Section[] | null
  published_sections: Section[] | null
  is_published: boolean
  text_ai_webhook_url: string | null
  voice_phone_number: string | null
  voice_phone_country_code: string | null
  phone_call_webhook_url: string | null
  form_ai_webhook_url: string | null
  created_at: string
  updated_at: string
}

export function useDemoPages(clientId: string) {
  const [pages, setPages] = useState<DemoPage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPages = useCallback(async () => {
    if (!clientId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('demo_pages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    if (!error && data) setPages(data as DemoPage[])
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const createPage = async (data: { title: string; slug: string }) => {
    const { data: newPage, error } = await supabase
      .from('demo_pages')
      .insert({
        ...data,
        client_id: clientId,
        sections: [],
        published_sections: null,
        is_published: false,
      })
      .select()
      .single()
    if (error) throw error
    await fetchPages()
    return newPage as DemoPage
  }

  const updatePage = async (id: string, data: Partial<DemoPage>) => {
    const { error } = await supabase
      .from('demo_pages')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await fetchPages()
  }

  const deletePage = async (id: string) => {
    const { error } = await supabase.from('demo_pages').delete().eq('id', id)
    if (error) throw error
    await fetchPages()
  }

  const togglePublish = async (page: DemoPage) => {
    const isPublishing = !page.is_published
    const updateData: Partial<DemoPage> = {
      is_published: isPublishing,
    }
    if (isPublishing) {
      updateData.published_sections = page.sections
    }
    const { error } = await supabase
      .from('demo_pages')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', page.id)
    if (error) throw error
    await fetchPages()
  }

  const uploadAsset = async (file: File, pageId: string): Promise<string> => {
    const ext = file.name.split('.').pop() ?? 'bin'
    const filePath = `${clientId}/${pageId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('demo-assets')
      .upload(filePath, file, { upsert: true })
    if (error) throw error
    const { data: urlData } = supabase.storage
      .from('demo-assets')
      .getPublicUrl(filePath)
    return urlData.publicUrl
  }

  return {
    pages,
    loading,
    createPage,
    updatePage,
    deletePage,
    togglePublish,
    uploadAsset,
    refetch: fetchPages,
  }
}

export function useDemoPage(pageId: string) {
  const [page, setPage] = useState<DemoPage | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPage = useCallback(async () => {
    if (!pageId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('demo_pages')
      .select('*')
      .eq('id', pageId)
      .single()
    if (!error && data) setPage(data as DemoPage)
    setLoading(false)
  }, [pageId])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  return { page, loading, refetch: fetchPage }
}

export function useDemoPageBySlug(slug: string) {
  const [page, setPage] = useState<DemoPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    supabase
      .from('demo_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
          setPage(null)
        } else {
          setPage(data as DemoPage)
          setNotFound(false)
        }
        setLoading(false)
      })
  }, [slug])

  return { page, loading, notFound }
}
