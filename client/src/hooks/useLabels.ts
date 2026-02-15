import { useCallback, useEffect, useRef, useState } from 'react'
import { api as gasApi } from '../services'
import type { Label } from '../types'
import { getErrorMessage } from '../utils/error'

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const labelsRef = useRef(labels)
  labelsRef.current = labels

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

  const createLabel = useCallback(async (name: string) => {
    setSaving(true)
    setError(null)
    try {
      const created = await gasApi.createLabel(name)
      setLabels((prev) => [...prev, created].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'user' ? -1 : 1
        return a.name.localeCompare(b.name)
      }))
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to create label'))
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const renameLabel = useCallback(async (labelId: string, newName: string) => {
    setSaving(true)
    setError(null)
    const snapshot = labelsRef.current
    try {
      // 楽観的更新（親ラベル + サブラベルのカスケード）
      const target = labelsRef.current.find((l) => l.id === labelId)
      const oldName = target?.name ?? ''
      const oldPrefix = oldName + '/'
      const newPrefix = newName + '/'
      setLabels((prev) =>
        prev.map((l) => {
          if (l.id === labelId) return { ...l, name: newName }
          if (l.name.startsWith(oldPrefix)) return { ...l, name: newPrefix + l.name.substring(oldPrefix.length) }
          return l
        }),
      )
      await gasApi.renameLabel(labelId, newName)
      // サーバーから最新を再取得（カスケード結果を正確に反映）
      const freshLabels = await gasApi.getLabels()
      setLabels(freshLabels)
      return true
    } catch (e) {
      setLabels(snapshot)
      setError(getErrorMessage(e, 'Failed to rename label'))
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const deleteLabel = useCallback(async (labelId: string) => {
    setSaving(true)
    setError(null)
    const snapshot = labelsRef.current
    try {
      // 楽観的更新（親ラベル + サブラベルのカスケード削除）
      const target = labelsRef.current.find((l) => l.id === labelId)
      const childPrefix = target ? target.name + '/' : ''
      setLabels((prev) => prev.filter((l) => l.id !== labelId && !(target && l.name.startsWith(childPrefix))))
      await gasApi.deleteLabel(labelId)
      return true
    } catch (e) {
      setLabels(snapshot)
      setError(getErrorMessage(e, 'Failed to delete label'))
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const updateLabelColor = useCallback(async (labelId: string, backgroundColor: string, textColor: string) => {
    setSaving(true)
    setError(null)
    const snapshot = labelsRef.current
    try {
      // 楽観的更新
      const color = backgroundColor && textColor ? { backgroundColor, textColor } : null
      setLabels((prev) =>
        prev.map((l) => (l.id === labelId ? { ...l, color } : l)),
      )
      const updated = await gasApi.updateLabelColor(labelId, backgroundColor, textColor)
      setLabels((prev) =>
        prev.map((l) => (l.id === labelId ? updated : l)),
      )
      return true
    } catch (e) {
      setLabels(snapshot)
      setError(getErrorMessage(e, 'Failed to update label color'))
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  return {
    labels,
    loading,
    saving,
    error,
    refetch: fetchLabels,
    createLabel,
    renameLabel,
    deleteLabel,
    updateLabelColor,
  }
}
