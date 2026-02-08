import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Collapse, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel,
  LinearProgress, MenuItem, Select, Snackbar, Stack, TextField, Typography,
  useMediaQuery,
} from '@mui/material'
import { Add as AddIcon, Search as SearchIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'
import { useDeleteRules } from '../../hooks/useDeleteRules'
import { useFilters } from '../../hooks/useFilters'
import { useLabelGroups } from '../../hooks/useLabelGroups'
import { useLabels } from '../../hooks/useLabels'
import { api as gasApi } from '../../services'
import type { DeleteRule, FilterEntry } from '../../types'
import { ConfirmDialog } from '../ConfirmDialog'
import { DeleteSchedule } from '../DeleteSchedule'
import { FilterEditForm } from '../FilterEditForm'
import { Modal } from '../Modal'
import { FilterTable } from './FilterTable'

export function RuleManager() {
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)')
  const cannotHover = useMediaQuery('(hover: none)')
  const isTouchDevice = navigator.maxTouchPoints > 0
  const isMobile = hasCoarsePointer || cannotHover || isTouchDevice

  const { filters, loading: filtersLoading, saving, error: filtersError, addFilter, updateFilter, deleteFilter } = useFilters()
  const { labels } = useLabels()
  const { rules: deleteRules, loading: rulesLoading, error: rulesError, saveRules, executeRule } = useDeleteRules()

  const [search, setSearch] = useState('')
  const [labelFilter, setLabelFilter] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [editingFilter, setEditingFilter] = useState<FilterEntry | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingFilterId, setDeletingFilterId] = useState<string | null>(null)
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)

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

  const deletingFilter = deletingFilterId ? filters.find((f) => f.id === deletingFilterId) : null

  async function applyToExistingAndNotify(
    criteria: FilterEntry['criteria'],
    action: FilterEntry['action']
  ) {
    try {
      const result = await gasApi.applyToExistingMessages({ criteria, action })

      if (result.error) {
        setSnackbarMessage(`エラー: ${result.error}`)
      } else if (result.count > 0) {
        const hasErrors = result.errors && result.errors.length > 0
        const suffix = hasErrors ? '（一部エラーあり）' : ''
        setSnackbarMessage(`${result.count}件のメールにラベルを適用しました${suffix}`)
      } else if (result.message) {
        setSnackbarMessage(result.message)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '不明なエラー'
      setSnackbarMessage(`既存メールへの適用に失敗: ${msg}`)
    }
  }

  async function handleCreate(filterData: Omit<FilterEntry, 'id'>, applyToExisting?: boolean) {
    const success = await addFilter(filterData)
    if (success) {
      if (applyToExisting && filterData.action.label) {
        await applyToExistingAndNotify(filterData.criteria, filterData.action)
      }
      setIsCreateModalOpen(false)
    }
  }

  async function handleUpdate(filterData: FilterEntry, applyToExisting?: boolean) {
    const success = await updateFilter(filterData.id, filterData)
    if (success) {
      if (applyToExisting && filterData.action.label) {
        await applyToExistingAndNotify(filterData.criteria, filterData.action)
      }
      setEditingFilter(null)
    }
  }

  async function handleDelete() {
    if (!deletingFilterId) return
    const success = await deleteFilter(deletingFilterId)
    if (success) {
      setDeletingFilterId(null)
    }
  }

  async function handleUpdateDeleteRule(labelName: string, updatedRule: DeleteRule | null) {
    if (updatedRule === null) {
      await saveRules(deleteRules.filter((r) => r.labelName !== labelName))
      return
    }

    const exists = deleteRules.some((r) => r.labelName === labelName)
    if (exists) {
      await saveRules(deleteRules.map((r) => (r.labelName === labelName ? updatedRule : r)))
    } else {
      await saveRules([...deleteRules, updatedRule])
    }
  }

  async function handleExecuteDeleteRule(labelName: string, days: number) {
    setSnackbarMessage(`${labelName} の削除を実行中...`)
    const count = await executeRule(labelName, days)
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      {saving && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}

      <Stack
        direction="column"
        spacing={isMobile ? 1 : 1}
        sx={{ mb: isMobile ? 1 : 1, width: '100%' }}
      >
        {/* モバイル: ボタン行を先に表示 */}
        {isMobile && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setIsCreateModalOpen(true)}
              sx={{ flex: 1 }}
            >
              新規
            </Button>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <DeleteSchedule />
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              sx={{
                bgcolor: isSearchExpanded ? 'primary.main' : 'grey.100',
                color: isSearchExpanded ? 'white' : 'text.secondary',
                '&:hover': {
                  bgcolor: isSearchExpanded ? 'primary.dark' : 'grey.200',
                },
              }}
            >
              {isSearchExpanded ? <ExpandLessIcon /> : <SearchIcon />}
            </IconButton>
          </Stack>
        )}

        {/* 検索・フィルター（モバイル: 折りたたみ可能、デスクトップ: 常に表示） */}
        {isMobile ? (
          <Collapse in={isSearchExpanded}>
            <Stack spacing={1.5}>
              <TextField
                size="small"
                placeholder="検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel id="label-filter-label">ラベル</InputLabel>
                  <Select
                    labelId="label-filter-label"
                    value={labelFilter}
                    onChange={(e) => setLabelFilter(e.target.value)}
                    label="ラベル"
                  >
                    <MenuItem value="">すべて</MenuItem>
                    {labelOptions.map((l) => (
                      <MenuItem key={l} value={l}>
                        {l}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {filteredFilters.length} / {filters.length} 件
                </Typography>
              </Stack>
            </Stack>
          </Collapse>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 150 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="label-filter-label">ラベル</InputLabel>
                <Select
                  labelId="label-filter-label"
                  value={labelFilter}
                  onChange={(e) => setLabelFilter(e.target.value)}
                  label="ラベル"
                >
                  <MenuItem value="">すべて</MenuItem>
                  {labelOptions.map((l) => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                {filteredFilters.length} / {filters.length} 件
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                新規
              </Button>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <DeleteSchedule />
              </Box>
            </Stack>
          </Stack>
        )}
      </Stack>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <FilterTable
          labelGroups={labelGroups}
          onEditFilter={setEditingFilter}
          onDeleteFilter={setDeletingFilterId}
          onUpdateDeleteRule={handleUpdateDeleteRule}
          onExecuteDeleteRule={handleExecuteDeleteRule}
        />
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
            onSave={(data, applyToExisting) => handleUpdate(data as FilterEntry, applyToExisting)}
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
        onCancel={() => setDeletingFilterId(null)}
      />

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={5000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </Box>
  )
}
