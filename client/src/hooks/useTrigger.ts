import { useCallback, useEffect, useState } from 'react'
import { api as gasApi } from '../services'
import type { TriggerStatus } from '../types'
import { getErrorMessage } from '../utils/error'

export function useTrigger() {
  const [status, setStatus] = useState<TriggerStatus>({ enabled: false, hour: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await gasApi.getTriggerStatus()
      setStatus(result)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const setupTrigger = useCallback(async (hour: number) => {
    setSaving(true)
    setError(null)
    try {
      const result = await gasApi.setupDeleteTrigger(hour)
      if (result.success) {
        setStatus({ enabled: true, hour: result.hour })
      }
      return result.success
    } catch (e) {
      setError(getErrorMessage(e))
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const removeTrigger = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const result = await gasApi.removeDeleteTrigger()
      if (result.success) {
        setStatus({ enabled: false, hour: null })
      }
      return result.success
    } catch (e) {
      setError(getErrorMessage(e))
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  return { status, loading, saving, error, setupTrigger, removeTrigger, refresh: fetchStatus }
}
