import { useCallback, useEffect, useState } from 'react'
import { gasApi } from '../services/gas'
import type { DeleteRule } from '../types'
import { getErrorMessage } from '../utils/error'

export function useDeleteRules() {
  const [rules, setRules] = useState<DeleteRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRules(await gasApi.getDeleteRules())
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to fetch delete rules'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const saveRules = useCallback(async (newRules: DeleteRule[]) => {
    setSaving(true)
    setError(null)
    try {
      await gasApi.saveDeleteRules(newRules)
      setRules(newRules)
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to save delete rules'))
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const executeRule = useCallback(async (labelName: string, days: number) => {
    try {
      const result = await gasApi.executeDeleteRule(labelName, days)
      return result.deleted
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to execute delete rule'))
      return -1
    }
  }, [])

  return { rules, loading, saving, error, refetch: fetchRules, saveRules, executeRule }
}
