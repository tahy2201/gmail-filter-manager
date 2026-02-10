import { useCallback, useEffect, useRef, useState } from 'react'
import { api as gasApi } from '../services'
import type { FilterEntry } from '../types'
import { getErrorMessage } from '../utils/error'

export function useFilters() {
  const [filters, setFilters] = useState<FilterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const fetchFilters = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await gasApi.getFilters()
      setFilters(data)
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to fetch filters'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFilters()
  }, [fetchFilters])

  const addFilter = useCallback(
    async (filter: Omit<FilterEntry, 'id'>) => {
      setSaving(true)
      setError(null)
      try {
        const created = await gasApi.createFilter(filter)
        setFilters((prev) => [...prev, created])
        return true
      } catch (e) {
        setError(getErrorMessage(e, 'Failed to create filter'))
        return false
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  const updateFilter = useCallback(
    async (filterId: string, updates: Partial<FilterEntry>) => {
      setSaving(true)
      setError(null)
      const snapshot = filtersRef.current
      try {
        // 楽観的更新
        setFilters((prev) =>
          prev.map((f) => (f.id === filterId ? { ...f, ...updates } : f)),
        )
        const target = snapshot.find((f) => f.id === filterId)
        if (!target) throw new Error('Filter not found')
        const merged = { ...target, ...updates }
        const updated = await gasApi.updateFilter(filterId, {
          criteria: merged.criteria,
          action: merged.action,
        })
        // サーバーから返された新IDで置き換え
        setFilters((prev) =>
          prev.map((f) => (f.id === filterId ? updated : f)),
        )
        return true
      } catch (e) {
        // ロールバック: 楽観的更新を取り消し、他の変更は保持
        setFilters((prev) => {
          const original = snapshot.find((f) => f.id === filterId)
          if (!original) return prev
          return prev.map((f) => (f.id === filterId ? original : f))
        })
        setError(getErrorMessage(e, 'Failed to update filter'))
        return false
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  const deleteFilter = useCallback(
    async (filterId: string) => {
      setSaving(true)
      setError(null)
      const snapshot = filtersRef.current
      try {
        // 楽観的更新
        setFilters((prev) => prev.filter((f) => f.id !== filterId))
        await gasApi.deleteFilter(filterId)
        return true
      } catch (e) {
        // ロールバック: 削除したフィルタを元の位置に復元
        setFilters((prev) => {
          const deleted = snapshot.find((f) => f.id === filterId)
          if (!deleted) return prev
          // 元の順序を復元するため snapshot の順序を基に再構築
          const currentIds = new Set(prev.map((f) => f.id))
          const restored = snapshot.filter(
            (f) => currentIds.has(f.id) || f.id === filterId,
          )
          return restored
        })
        setError(getErrorMessage(e, 'Failed to delete filter'))
        return false
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  return {
    filters,
    loading,
    saving,
    error,
    refetch: fetchFilters,
    addFilter,
    updateFilter,
    deleteFilter,
  }
}
