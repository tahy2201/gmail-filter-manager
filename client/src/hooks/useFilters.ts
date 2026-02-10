import { useCallback, useEffect, useState } from 'react'
import { api as gasApi } from '../services'
import type { FilterEntry } from '../types'
import { getErrorMessage } from '../utils/error'

export function useFilters() {
  const [filters, setFilters] = useState<FilterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const previousFilters = filters
      try {
        // 楽観的更新
        setFilters((prev) =>
          prev.map((f) => (f.id === filterId ? { ...f, ...updates } : f)),
        )
        const target = filters.find((f) => f.id === filterId)
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
        setFilters(previousFilters)
        setError(getErrorMessage(e, 'Failed to update filter'))
        return false
      } finally {
        setSaving(false)
      }
    },
    [filters],
  )

  const deleteFilter = useCallback(
    async (filterId: string) => {
      setSaving(true)
      setError(null)
      const previousFilters = filters
      try {
        // 楽観的更新
        setFilters((prev) => prev.filter((f) => f.id !== filterId))
        await gasApi.deleteFilter(filterId)
        return true
      } catch (e) {
        setFilters(previousFilters)
        setError(getErrorMessage(e, 'Failed to delete filter'))
        return false
      } finally {
        setSaving(false)
      }
    },
    [filters],
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
