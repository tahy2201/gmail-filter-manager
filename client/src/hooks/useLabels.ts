import { useCallback, useEffect, useState } from 'react'
import { api as gasApi } from '../services'
import type { Label } from '../types'
import { getErrorMessage } from '../utils/error'

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await gasApi.getLabels()
      setLabels(data)
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to fetch labels'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  return { labels, loading, error, refetch: fetchLabels }
}
