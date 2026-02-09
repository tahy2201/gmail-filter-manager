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

  // 楽観的更新版のsaveFilters（自動Gmail同期付き）
  const saveFilters = useCallback(async (newFilters: FilterEntry[], previousFilters: FilterEntry[]) => {
    setSaving(true)
    setError(null)
    try {
      await gasApi.saveFilters(newFilters)
      // Gmail同期失敗は警告のみ（スプレッドシートには保存済み）
      await gasApi.applyFilterDiff(false).catch((e: Error) => {
        setError(`保存完了。Gmail同期に失敗: ${e.message}`)
      })
      return true
    } catch (e) {
      setFilters(previousFilters)
      setError(getErrorMessage(e, 'Failed to save filters'))
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const importFromXml = useCallback(
    async (xml: string) => {
      setLoading(true)
      setError(null)
      try {
        await gasApi.importFiltersXml(xml)
        await fetchFilters()
        return true
      } catch (e) {
        setError(getErrorMessage(e, 'Failed to import filters'))
        return false
      } finally {
        setLoading(false)
      }
    },
    [fetchFilters],
  )

  // 楽観的更新: 即座にUIを更新し、バックグラウンドで保存
  const addFilter = useCallback(
    async (filter: Omit<FilterEntry, 'id'>) => {
      const newFilter: FilterEntry = {
        ...filter,
        id: `filter_${Date.now()}`,
      }
      const previousFilters = filters
      const newFilters = [...filters, newFilter]

      // 即座にUIを更新
      setFilters(newFilters)

      // バックグラウンドで保存
      return saveFilters(newFilters, previousFilters)
    },
    [filters, saveFilters],
  )

  const updateFilter = useCallback(
    async (filterId: string, updates: Partial<FilterEntry>) => {
      const previousFilters = filters
      const newFilters = filters.map((f) =>
        f.id === filterId ? { ...f, ...updates } : f,
      )

      // 即座にUIを更新
      setFilters(newFilters)

      // バックグラウンドで保存
      return saveFilters(newFilters, previousFilters)
    },
    [filters, saveFilters],
  )

  const deleteFilter = useCallback(
    async (filterId: string) => {
      const previousFilters = filters
      const newFilters = filters.filter((f) => f.id !== filterId)

      // 即座にUIを更新
      setFilters(newFilters)

      // バックグラウンドで保存
      return saveFilters(newFilters, previousFilters)
    },
    [filters, saveFilters],
  )

  return {
    filters,
    loading,
    saving,
    error,
    refetch: fetchFilters,
    importFromXml,
    addFilter,
    updateFilter,
    deleteFilter,
  }
}
