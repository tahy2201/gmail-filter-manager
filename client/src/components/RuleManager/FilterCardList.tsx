import { useState } from 'react'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'
import type { DeleteRule, FilterEntry, LabelGroupData } from '../../types'
import { FilterCard } from './FilterCard'
import { DeleteRuleDialog } from './DeleteRuleDialog'

interface FilterCardListProps {
  labelGroups: LabelGroupData[]
  onEditFilter?: (filter: FilterEntry) => void
  onDeleteFilter?: (filterId: string) => void
  onUpdateDeleteRule?: (labelId: string, labelName: string, rule: DeleteRule | null) => void
  onExecuteDeleteRule?: (labelId: string, labelName: string, days: number) => Promise<number>
}

/**
 * ラベルグループごとにセクションヘッダー + カードリストを表示
 * セクションヘッダーをタップ → 削除ルール編集Dialogを開く
 */
export function FilterCardList({
  labelGroups,
  onEditFilter,
  onDeleteFilter,
  onUpdateDeleteRule,
  onExecuteDeleteRule,
}: FilterCardListProps) {
  const [dialogState, setDialogState] = useState<{
    open: boolean
    labelId: string
    labelName: string
    deleteRule: DeleteRule | null
  }>({ open: false, labelId: '', labelName: '', deleteRule: null })

  function handleSectionClick(labelId: string, labelName: string, deleteRule: DeleteRule | null) {
    setDialogState({ open: true, labelId, labelName, deleteRule })
  }

  function handleCloseDialog() {
    setDialogState({ open: false, labelId: '', labelName: '', deleteRule: null })
  }

  // 空の場合
  if (labelGroups.length === 0 || labelGroups.every((g) => g.filters.length === 0)) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary" sx={{ fontSize: '2.25rem' }}>
          フィルタがありません
        </Typography>
      </Paper>
    )
  }

  return (
    <>
      <Box sx={{ height: '100%', overflow: 'auto', px: 2, py: 2 }}>
        {labelGroups.map((group) => {
          if (group.filters.length === 0) return null

          return (
            <Box key={group.labelName} sx={{ mb: 3 }}>
              {/* セクションヘッダー */}
              <Paper
                sx={{
                  px: 2,
                  py: 1,
                  mb: 1.5,
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  minHeight: '55px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:active': {
                    bgcolor: 'primary.dark',
                  },
                }}
                onClick={() => handleSectionClick(group.labelId, group.labelName, group.deleteRule)}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '18px' }}>
                  {group.labelName}
                </Typography>
                {group.deleteRule && (
                  <Chip
                    label={`${group.deleteRule.delayDays}日後削除`}
                    size="small"
                    sx={{
                      bgcolor: group.deleteRule.enabled ? 'warning.main' : 'grey.300',
                      color: group.deleteRule.enabled ? 'warning.contrastText' : 'text.secondary',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      height: 'auto',
                      py: 0,
                      '& .MuiChip-label': { px: 2, py: 1 }
                    }}
                  />
                )}
              </Paper>

              {/* フィルタカード群 */}
              <Stack spacing={1.5}>
                {group.filters.map((filter) => (
                  <FilterCard
                    key={filter.id}
                    filter={filter}
                    labelName={group.labelName}
                    deleteRule={group.deleteRule}
                    onEdit={onEditFilter}
                    onDelete={onDeleteFilter}
                  />
                ))}
              </Stack>
            </Box>
          )
        })}
      </Box>

      {/* 削除ルール編集Dialog */}
      <DeleteRuleDialog
        open={dialogState.open}
        onClose={handleCloseDialog}
        labelId={dialogState.labelId}
        labelName={dialogState.labelName}
        deleteRule={dialogState.deleteRule}
        onUpdateDeleteRule={onUpdateDeleteRule}
        onExecuteDeleteRule={onExecuteDeleteRule}
      />
    </>
  )
}
