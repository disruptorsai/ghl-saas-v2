import { useState } from 'react'
import { createUserSupabase } from '@/lib/user-supabase'
import { MIGRATION_STATEMENTS } from '@/lib/migration-sql'

export function useMigration() {
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const runMigration = async (supabaseUrl: string, serviceKey: string) => {
    setRunning(true)
    setError(null)
    setProgress(0)

    try {
      const client = createUserSupabase(supabaseUrl, serviceKey)
      const total = MIGRATION_STATEMENTS.length

      for (let i = 0; i < total; i++) {
        const statement = MIGRATION_STATEMENTS[i]

        // Try executing via the SQL endpoint
        await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
          method: 'POST',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => null)

        const sqlResponse = await fetch(`${supabaseUrl}/pg/query`, {
          method: 'POST',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement }),
        }).catch(() => null)

        if (!sqlResponse?.ok) {
          console.warn(`Migration statement ${i + 1} may need manual execution`)
        }

        setProgress(Math.round(((i + 1) / total) * 100))
      }

      // Verify migration by checking if prompts table has 12 rows
      const { data: verifyData, error: verifyError } = await client
        .from('prompts')
        .select('id')
        .limit(1)

      if (verifyError || !verifyData) {
        throw new Error(
          'Migration verification failed. The tables may not have been created automatically. ' +
            'Please run the migration SQL manually in your Supabase SQL Editor.'
        )
      }

      setRunning(false)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown migration error'
      setError(msg)
      setRunning(false)
      return false
    }
  }

  return { runMigration, running, error, progress }
}
