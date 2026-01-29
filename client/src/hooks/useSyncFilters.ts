import { useCallback, useState } from 'react'
import { gasApi } from '../services/gas'
import type { FilterDiffPreview, FilterDiffResult } from '../types'

interface UseSyncFiltersReturn {
  preview: FilterDiffPreview | null
  result: FilterDiffResult | null
  loading: boolean
  error: string | null
  fetchPreview: () => Promise<void>
  applyDiff: () => Promise<void>
  reset: () => void
}

export function useSyncFilters(): UseSyncFiltersReturn {
  const [preview, setPreview] = useState<FilterDiffPreview | null>(null)
  const [result, setResult] = useState<FilterDiffResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPreview = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await gasApi.previewFilterDiff()
      setPreview(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch preview')
    } finally {
      setLoading(false)
    }
  }, [])

  const applyDiff = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await gasApi.applyFilterDiff(false)
      setResult(data)
      setPreview(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to apply changes')
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setPreview(null)
    setResult(null)
    setError(null)
  }, [])

  return {
    preview,
    result,
    loading,
    error,
    fetchPreview,
    applyDiff,
    reset,
  }
}
