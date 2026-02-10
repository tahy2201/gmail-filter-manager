import { useCallback, useEffect, useState } from 'react'
import { api as gasApi } from '../services'
import { getErrorMessage } from '../utils/error'

export function useSpreadsheet() {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchUrl = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await gasApi.getDataSpreadsheetUrl()
      setUrl(result.url)
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to fetch spreadsheet URL'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUrl()
  }, [fetchUrl])

  const updateSpreadsheetId = useCallback(async (spreadsheetId: string) => {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const result = await gasApi.updateSpreadsheetReference(spreadsheetId)
      setUrl(result.url)
      setSuccessMessage('スプレッドシートの参照先を更新しました')
      setTimeout(() => setSuccessMessage(null), 3000)
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to update spreadsheet reference'))
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  return { url, loading, saving, error, successMessage, updateSpreadsheetId, clearMessages, refetch: fetchUrl }
}
