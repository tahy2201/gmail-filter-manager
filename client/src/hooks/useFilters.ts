import { useCallback, useEffect, useState } from 'react'
import { gasApi } from '../services/gas'
import type { FilterEntry } from '../types'

export function useFilters() {
  const [filters, setFilters] = useState<FilterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFilters = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await gasApi.getFilters()
      setFilters(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch filters')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFilters()
  }, [fetchFilters])

  const saveFilters = useCallback(async (newFilters: FilterEntry[]) => {
    setLoading(true)
    setError(null)
    try {
      await gasApi.saveFilters(newFilters)
      setFilters(newFilters)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save filters')
      return false
    } finally {
      setLoading(false)
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
        setError(e instanceof Error ? e.message : 'Failed to import filters')
        return false
      } finally {
        setLoading(false)
      }
    },
    [fetchFilters],
  )

  const addFilter = useCallback(
    async (filter: Omit<FilterEntry, 'id'>) => {
      const newFilter: FilterEntry = {
        ...filter,
        id: `filter_${Date.now()}`,
      }
      return saveFilters([...filters, newFilter])
    },
    [filters, saveFilters],
  )

  const updateFilter = useCallback(
    async (filterId: string, updates: Partial<FilterEntry>) => {
      const newFilters = filters.map((f) =>
        f.id === filterId ? { ...f, ...updates } : f,
      )
      return saveFilters(newFilters)
    },
    [filters, saveFilters],
  )

  const deleteFilter = useCallback(
    async (filterId: string) => {
      const newFilters = filters.filter((f) => f.id !== filterId)
      return saveFilters(newFilters)
    },
    [filters, saveFilters],
  )

  return {
    filters,
    loading,
    error,
    refetch: fetchFilters,
    saveFilters,
    importFromXml,
    addFilter,
    updateFilter,
    deleteFilter,
  }
}
