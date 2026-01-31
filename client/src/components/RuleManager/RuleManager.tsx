import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { useDeleteRules } from '../../hooks/useDeleteRules'
import { useFilters } from '../../hooks/useFilters'
import { useLabelGroups } from '../../hooks/useLabelGroups'
import { useLabels } from '../../hooks/useLabels'
import { gasApi } from '../../services/gas'
import type { DeleteRule, FilterEntry } from '../../types'
import { ConfirmDialog } from '../ConfirmDialog'
import { FilterEditForm } from '../FilterEditForm'
import { Modal } from '../Modal'
import { FilterTable } from './FilterTable'

export function RuleManager() {
  const { filters, loading: filtersLoading, saving, error: filtersError, addFilter, updateFilter, deleteFilter } = useFilters()
  const { labels } = useLabels()
  const { rules: deleteRules, loading: rulesLoading, error: rulesError, saveRules, executeRule } = useDeleteRules()

  const [search, setSearch] = useState('')
  const [labelFilter, setLabelFilter] = useState('')
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

  const deletingFilter = deletingFilterId
    ? filters.find((f) => f.id === deletingFilterId)
    : null

  // 既存メールへのフィルタ適用を実行し、結果をSnackbarで表示
  const applyToExistingAndNotify = async (
    criteria: FilterEntry['criteria'],
    action: FilterEntry['action']
  ) => {
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

  const handleCreate = async (filterData: Omit<FilterEntry, 'id'>, applyToExisting?: boolean) => {
    const success = await addFilter(filterData)
    if (success) {
      if (applyToExisting && filterData.action.label) {
        await applyToExistingAndNotify(filterData.criteria, filterData.action)
      }
      setIsCreateModalOpen(false)
    }
  }

  const handleUpdate = async (filterData: FilterEntry, applyToExisting?: boolean) => {
    const success = await updateFilter(filterData.id, filterData)
    if (success) {
      if (applyToExisting && filterData.action.label) {
        await applyToExistingAndNotify(filterData.criteria, filterData.action)
      }
      setEditingFilter(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingFilterId) return
    const success = await deleteFilter(deletingFilterId)
    if (success) {
      setDeletingFilterId(null)
    }
  }

  const handleUpdateDeleteRule = async (labelName: string, updatedRule: DeleteRule | null) => {
    if (updatedRule === null) {
      const newRules = deleteRules.filter((r) => r.labelName !== labelName)
      await saveRules(newRules)
    } else {
      const existingRule = deleteRules.find((r) => r.labelName === labelName)
      if (existingRule) {
        const newRules = deleteRules.map((r) =>
          r.labelName === labelName ? updatedRule : r
        )
        await saveRules(newRules)
      } else {
        await saveRules([...deleteRules, updatedRule])
      }
    }
  }

  const handleExecuteDeleteRule = async (labelName: string, days: number) => {
    return executeRule(labelName, days)
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

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      {/* 保存中のプログレスバー */}
      {saving && (
        <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
      )}

      {/* コンパクトなツールバー */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}
      >
        {/* 新規追加ボタン */}
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          新規
        </Button>

        {/* 検索 */}
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

        {/* ラベルフィルタ */}
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

        {/* 件数 */}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {filteredFilters.length} / {filters.length} 件
        </Typography>
      </Stack>

      {/* フィルタテーブル（残りの高さを使用） */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <FilterTable
          labelGroups={labelGroups}
          onEditFilter={setEditingFilter}
          onDeleteFilter={setDeletingFilterId}
          onUpdateDeleteRule={handleUpdateDeleteRule}
          onExecuteDeleteRule={handleExecuteDeleteRule}
        />
      </Box>

      {/* 新規作成モーダル */}
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

      {/* 編集モーダル */}
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

      {/* スナックバー */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </Box>
  )
}
