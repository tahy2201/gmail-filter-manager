import { useMemo, useState } from 'react'
import { useFilters } from '../hooks/useFilters'
import { useLabels } from '../hooks/useLabels'
import type { FilterEntry } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { FilterCard } from './FilterCard'
import { FilterEditForm } from './FilterEditForm'
import { Modal } from './Modal'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  toolbar: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '200px',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  stats: {
    color: '#5f6368',
    fontSize: '14px',
    marginLeft: 'auto',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#5f6368',
  },
  error: {
    padding: '16px',
    backgroundColor: '#fce8e6',
    color: '#c5221f',
    borderRadius: '4px',
  },
  groupHeader: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#1a73e8',
    padding: '12px 0 8px',
    borderBottom: '1px solid #e0e0e0',
    marginTop: '16px',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '12px',
  },
  createButton: {
    padding: '8px 16px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#1a73e8',
    color: '#fff',
    fontWeight: 'bold' as const,
  },
}

function groupByLabel(filters: FilterEntry[]): Map<string, FilterEntry[]> {
  const groups = new Map<string, FilterEntry[]>()
  for (const filter of filters) {
    const label = filter.action.label || '(ラベルなし)'
    const topLevel = label.split('/')[0]
    if (!groups.has(topLevel)) {
      groups.set(topLevel, [])
    }
    const group = groups.get(topLevel)
    if (group) {
      group.push(filter)
    }
  }
  return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])))
}

export function FilterList() {
  const { filters, loading, error, addFilter, updateFilter, deleteFilter } =
    useFilters()
  const { labels } = useLabels()
  const [search, setSearch] = useState('')
  const [labelFilter, setLabelFilter] = useState('')
  const [editingFilter, setEditingFilter] = useState<FilterEntry | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingFilterId, setDeletingFilterId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const labelOptions = useMemo(() => {
    const set = new Set<string>()
    for (const f of filters) {
      if (f.action.label) {
        set.add(f.action.label.split('/')[0])
      }
    }
    return Array.from(set).sort()
  }, [filters])

  const filteredFilters = useMemo(() => {
    return filters.filter((f) => {
      const searchLower = search.toLowerCase()
      const matchesSearch =
        !search ||
        f.criteria.from?.toLowerCase().includes(searchLower) ||
        f.criteria.to?.toLowerCase().includes(searchLower) ||
        f.criteria.subject?.toLowerCase().includes(searchLower) ||
        f.criteria.hasTheWord?.toLowerCase().includes(searchLower) ||
        f.action.label?.toLowerCase().includes(searchLower)

      const matchesLabel =
        !labelFilter || f.action.label?.startsWith(labelFilter)

      return matchesSearch && matchesLabel
    })
  }, [filters, search, labelFilter])

  const grouped = useMemo(
    () => groupByLabel(filteredFilters),
    [filteredFilters],
  )

  const deletingFilter = deletingFilterId
    ? filters.find((f) => f.id === deletingFilterId)
    : null

  const handleCreate = async (filterData: Omit<FilterEntry, 'id'>) => {
    setSaving(true)
    const success = await addFilter(filterData)
    setSaving(false)
    if (success) {
      setIsCreateModalOpen(false)
    }
  }

  const handleUpdate = async (filterData: FilterEntry) => {
    setSaving(true)
    const success = await updateFilter(filterData.id, filterData)
    setSaving(false)
    if (success) {
      setEditingFilter(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingFilterId) return
    setSaving(true)
    const success = await deleteFilter(deletingFilterId)
    setSaving(false)
    if (success) {
      setDeletingFilterId(null)
    }
  }

  if (loading) {
    return <div style={styles.loading}>フィルタを読み込み中...</div>
  }

  if (error) {
    return <div style={styles.error}>{error}</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <button
          type="button"
          style={styles.createButton}
          onClick={() => setIsCreateModalOpen(true)}
        >
          + 新規作成
        </button>
        <input
          type="text"
          placeholder="フィルタを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={labelFilter}
          onChange={(e) => setLabelFilter(e.target.value)}
          style={styles.select}
        >
          <option value="">すべてのラベル</option>
          {labelOptions.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <span style={styles.stats}>
          {filteredFilters.length} / {filters.length} 件
        </span>
      </div>

      {Array.from(grouped.entries()).map(([label, groupFilters]) => (
        <div key={label}>
          <h3 style={styles.groupHeader}>{label}</h3>
          <div style={styles.filterGrid}>
            {groupFilters.map((filter) => (
              <FilterCard
                key={filter.id}
                filter={filter}
                onEdit={setEditingFilter}
                onDelete={setDeletingFilterId}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 新規作成モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="フィルタを作成"
      >
        <FilterEditForm
          labels={labels}
          onSave={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={saving}
        />
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={!!editingFilter}
        onClose={() => setEditingFilter(null)}
        title="フィルタを編集"
      >
        {editingFilter && (
          <FilterEditForm
            filter={editingFilter}
            labels={labels}
            onSave={(data) => handleUpdate(data as FilterEntry)}
            onCancel={() => setEditingFilter(null)}
            loading={saving}
          />
        )}
      </Modal>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={!!deletingFilterId}
        title="フィルタを削除"
        message={
          deletingFilter
            ? `「${deletingFilter.action.label || deletingFilter.criteria.from || '条件'}」のフィルタを削除しますか？この操作は取り消せません。`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingFilterId(null)}
      />
    </div>
  )
}
