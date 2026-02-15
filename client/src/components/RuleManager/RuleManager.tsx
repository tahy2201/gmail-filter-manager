import {
  Alert,
  Box,
  CircularProgress,
  LinearProgress,
  Snackbar,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useDeleteRules } from '../../hooks/useDeleteRules'
import { useFilters } from '../../hooks/useFilters'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useLabelGroups } from '../../hooks/useLabelGroups'
import { useLabels } from '../../hooks/useLabels'
import { api as gasApi } from '../../services'
import type { DeleteRule, FilterEntry } from '../../types'
import { ConfirmDialog } from '../ConfirmDialog'
import { FilterEditForm } from '../FilterEditForm'
import { LabelManager } from '../LabelManager'
import { Modal } from '../Modal'
import { FilterCardList } from './FilterCardList'
import { FilterTable } from './FilterTable'
import { ToolbarLayout } from './ToolbarLayout'

export function RuleManager() {
  const isMobile = useIsMobile()

  const {
    filters,
    loading: filtersLoading,
    saving,
    error: filtersError,
    addFilter,
    updateFilter,
    deleteFilter,
    refetch: refetchFilters,
  } = useFilters()
  const {
    labels,
    saving: labelSaving,
    createLabel,
    renameLabel: renameLabelFn,
    deleteLabel: deleteLabelFn,
    updateLabelColor,
  } = useLabels()
  const {
    rules: deleteRules,
    loading: rulesLoading,
    error: rulesError,
    saveRules,
    executeRule,
    refetch: refetchDeleteRules,
  } = useDeleteRules()

  const [search, setSearch] = useState('')
  const [labelFilter, setLabelFilter] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [editingFilter, setEditingFilter] = useState<FilterEntry | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingFilterId, setDeletingFilterId] = useState<string | null>(null)
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false)

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

  const labelGroups = useLabelGroups({
    filters: filteredFilters,
    deleteRules,
  })

  const deletingFilter = deletingFilterId
    ? filters.find((f) => f.id === deletingFilterId)
    : null

  async function applyToExistingAndNotify(
    criteria: FilterEntry['criteria'],
    action: FilterEntry['action'],
  ) {
    setSnackbarMessage('既存メールへのラベル適用中...')
    try {
      const result = await gasApi.applyToExistingMessages({ criteria, action })

      if (result.error) {
        setSnackbarMessage(`エラー: ${result.error}`)
      } else if (result.count > 0) {
        const hasErrors = result.errors && result.errors.length > 0
        const suffix = hasErrors ? '（一部エラーあり）' : ''
        setSnackbarMessage(
          `${result.count}件のメールにラベルを適用しました${suffix}`,
        )
      } else if (result.message) {
        setSnackbarMessage(result.message)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '不明なエラー'
      setSnackbarMessage(`既存メールへの適用に失敗: ${msg}`)
    }
  }

  async function handleCreate(
    filterData: Omit<FilterEntry, 'id'>,
    applyToExisting?: boolean,
  ) {
    const success = await addFilter(filterData)
    if (success) {
      setIsCreateModalOpen(false)
      if (applyToExisting && filterData.action.label) {
        applyToExistingAndNotify(filterData.criteria, filterData.action)
      }
    }
  }

  async function handleUpdate(
    filterData: FilterEntry,
    applyToExisting?: boolean,
  ) {
    const success = await updateFilter(filterData.id, filterData)
    if (success) {
      setEditingFilter(null)
      if (applyToExisting && filterData.action.label) {
        applyToExistingAndNotify(filterData.criteria, filterData.action)
      }
    }
  }

  async function handleDelete() {
    if (!deletingFilterId) return
    const success = await deleteFilter(deletingFilterId)
    if (success) {
      setDeletingFilterId(null)
    }
  }

  async function handleUpdateDeleteRule(
    labelId: string,
    _labelName: string,
    updatedRule: DeleteRule | null,
  ) {
    if (updatedRule === null) {
      await saveRules(deleteRules.filter((r) => r.labelId !== labelId))
      return
    }

    const exists = deleteRules.some((r) => r.labelId === labelId)
    if (exists) {
      await saveRules(
        deleteRules.map((r) => (r.labelId === labelId ? updatedRule : r)),
      )
    } else {
      await saveRules([...deleteRules, updatedRule])
    }
  }

  async function handleExecuteDeleteRule(
    labelId: string,
    labelName: string,
    days: number,
  ) {
    setSnackbarMessage(`${labelName} の削除を実行中...`)
    const count = await executeRule(labelId, days)
    if (count >= 0) {
      setSnackbarMessage(`${labelName}: ${count}件のメールを削除しました`)
    } else {
      setSnackbarMessage(`${labelName}: 削除に失敗しました`)
    }
    return count
  }

  const loading = filtersLoading || rulesLoading
  const error = filtersError || rulesError

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
      }}
    >
      {saving && (
        <LinearProgress
          sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        />
      )}

      <ToolbarLayout
        isMobile={isMobile}
        search={search}
        onSearchChange={setSearch}
        labelFilter={labelFilter}
        onLabelFilterChange={setLabelFilter}
        labelOptions={labelOptions}
        filterCount={`${filteredFilters.length} / ${filters.length} 件`}
        isSearchExpanded={isSearchExpanded}
        onToggleSearch={() => setIsSearchExpanded(!isSearchExpanded)}
        onCreateNew={() => setIsCreateModalOpen(true)}
        onOpenLabelManager={() => setIsLabelManagerOpen(true)}
      />

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {isMobile ? (
          <FilterCardList
            labelGroups={labelGroups}
            onEditFilter={setEditingFilter}
            onDeleteFilter={setDeletingFilterId}
            onUpdateDeleteRule={handleUpdateDeleteRule}
            onExecuteDeleteRule={handleExecuteDeleteRule}
          />
        ) : (
          <FilterTable
            labelGroups={labelGroups}
            onEditFilter={setEditingFilter}
            onDeleteFilter={setDeletingFilterId}
            onUpdateDeleteRule={handleUpdateDeleteRule}
            onExecuteDeleteRule={handleExecuteDeleteRule}
          />
        )}
      </Box>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !saving && setIsCreateModalOpen(false)}
        title="フィルタを作成"
      >
        <FilterEditForm
          labels={labels}
          onSave={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={saving}
        />
      </Modal>

      <Modal
        isOpen={!!editingFilter}
        onClose={() => !saving && setEditingFilter(null)}
        title="フィルタを編集"
      >
        {editingFilter && (
          <FilterEditForm
            filter={editingFilter}
            labels={labels}
            onSave={(data, applyToExisting) =>
              handleUpdate(data as FilterEntry, applyToExisting)
            }
            onCancel={() => setEditingFilter(null)}
            loading={saving}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingFilterId}
        title="フィルタを削除"
        message={
          deletingFilter
            ? `「${deletingFilter.action.label || deletingFilter.criteria.from || '条件'}」のフィルタを削除しますか？この操作は取り消せません。`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => !saving && setDeletingFilterId(null)}
        loading={saving}
      />

      <Modal
        isOpen={isLabelManagerOpen}
        onClose={() => !labelSaving && setIsLabelManagerOpen(false)}
        title="ラベル管理"
      >
        <LabelManager
          labels={labels}
          saving={labelSaving}
          onCreateLabel={createLabel}
          onRenameLabel={async (labelId, newName) => {
            const success = await renameLabelFn(labelId, newName)
            if (success) refetchDeleteRules()
            return success
          }}
          onDeleteLabel={async (labelId) => {
            const success = await deleteLabelFn(labelId)
            if (success) {
              refetchFilters()
              refetchDeleteRules()
            }
            return success
          }}
          onUpdateLabelColor={updateLabelColor}
        />
      </Modal>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={5000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </Box>
  )
}
