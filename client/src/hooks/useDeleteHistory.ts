import { useCallback, useEffect, useState } from 'react'
import { gasApi } from '../services/gas'
import type { HistoryEntry } from '../types'

export function useDeleteHistory(limit = 50) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await gasApi.getDeleteHistory(limit)
      setHistory(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading, error, refresh: fetchHistory }
}
