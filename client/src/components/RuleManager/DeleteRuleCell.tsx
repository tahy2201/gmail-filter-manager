import { useState } from 'react'
import {
  Box, Button, Chip, Popover, Stack, Switch,
  TableCell, TextField, Tooltip, Typography,
} from '@mui/material'
import { Add as AddIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material'
import type { DeleteRule } from '../../types'

interface DeleteRuleCellProps {
  deleteRule: DeleteRule | null
  rowSpan: number
  labelId: string
  labelName: string
  onUpdateDeleteRule?: (labelId: string, labelName: string, rule: DeleteRule | null) => void
  onExecuteDeleteRule?: (labelId: string, labelName: string, days: number) => Promise<number>
}

export function DeleteRuleCell({ deleteRule, rowSpan, labelId, labelName, onUpdateDeleteRule, onExecuteDeleteRule }: DeleteRuleCellProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [editDaysStr, setEditDaysStr] = useState(String(deleteRule?.delayDays ?? 30))
  const [executing, setExecuting] = useState(false)

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    setEditDaysStr(String(deleteRule?.delayDays ?? 30))
    setAnchorEl(e.currentTarget)
  }

  function handleClose() { setAnchorEl(null) }

  function handleToggle() {
    if (!deleteRule || !onUpdateDeleteRule) return
    onUpdateDeleteRule(labelId, labelName, { ...deleteRule, enabled: !deleteRule.enabled })
  }

  function handleSave() {
    if (!onUpdateDeleteRule) return
    onUpdateDeleteRule(labelId, labelName, { labelId, labelName, delayDays: Number(editDaysStr) || 1, enabled: deleteRule?.enabled ?? true })
    handleClose()
  }

  function handleRemove() {
    if (!onUpdateDeleteRule) return
    onUpdateDeleteRule(labelId, labelName, null)
    handleClose()
  }

  async function handleExecute() {
    if (!deleteRule || !onExecuteDeleteRule || executing) return
    setExecuting(true)
    handleClose()
    try {
      await onExecuteDeleteRule(labelId, labelName, deleteRule.delayDays)
    } finally {
      setExecuting(false)
    }
  }

  const open = Boolean(anchorEl)

  return (
    <TableCell
      rowSpan={rowSpan}
      sx={{
        minWidth: 100,
        verticalAlign: 'top',
        pt: 1,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onClick={handleClick}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
        {deleteRule ? (
          <Chip
            label={`${deleteRule.delayDays}日後`}
            size="small"
            color={deleteRule.enabled ? 'warning' : 'default'}
            variant={deleteRule.enabled ? 'filled' : 'outlined'}
          />
        ) : (
          <Tooltip title="削除ルールを追加">
            <AddIcon fontSize="small" sx={{ color: 'text.disabled' }} />
          </Tooltip>
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ p: 2, minWidth: 220 }}>
          <Typography variant="subtitle2" gutterBottom>
            {deleteRule ? '削除ルール編集' : '削除ルール追加'}
          </Typography>

          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                type="number"
                size="small"
                value={editDaysStr}
                onChange={(e) => setEditDaysStr(e.target.value)}
                inputProps={{ min: 1 }}
                sx={{ width: 80 }}
              />
              <Typography variant="body2">日後に自動削除</Typography>
            </Stack>

            {deleteRule && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch
                  size="small"
                  checked={deleteRule.enabled}
                  onChange={handleToggle}
                />
                <Typography variant="body2">
                  {deleteRule.enabled ? '有効' : '無効'}
                </Typography>
              </Stack>
            )}

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
              >
                {deleteRule ? '更新' : '追加'}
              </Button>
              {deleteRule && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={handleExecute}
                    disabled={executing || !deleteRule.enabled}
                    startIcon={<PlayArrowIcon />}
                  >
                    実行
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={handleRemove}
                  >
                    削除
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </TableCell>
  )
}
