import { useState } from 'react'
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, Switch, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material'
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material'
import type { DeleteRule } from '../../types'

interface DeleteRuleDialogProps {
  open: boolean
  onClose: () => void
  labelName: string
  deleteRule: DeleteRule | null
  onUpdateDeleteRule?: (labelName: string, rule: DeleteRule | null) => void
  onExecuteDeleteRule?: (labelName: string, days: number) => Promise<number>
}

/**
 * モバイル用の削除ルール編集ダイアログ
 * モバイル: 全画面表示
 * タブレット以上: 通常サイズ
 */
export function DeleteRuleDialog({
  open,
  onClose,
  labelName,
  deleteRule,
  onUpdateDeleteRule,
  onExecuteDeleteRule,
}: DeleteRuleDialogProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [editDaysStr, setEditDaysStr] = useState(String(deleteRule?.delayDays ?? 30))
  const [executing, setExecuting] = useState(false)

  function handleToggle() {
    if (!deleteRule || !onUpdateDeleteRule) return
    onUpdateDeleteRule(labelName, { ...deleteRule, enabled: !deleteRule.enabled })
  }

  function handleSave() {
    if (!onUpdateDeleteRule) return
    onUpdateDeleteRule(labelName, {
      labelName,
      delayDays: Number(editDaysStr) || 1,
      enabled: deleteRule?.enabled ?? true,
    })
    onClose()
  }

  function handleRemove() {
    if (!onUpdateDeleteRule) return
    onUpdateDeleteRule(labelName, null)
    onClose()
  }

  async function handleExecute() {
    if (!deleteRule || !onExecuteDeleteRule || executing) return
    setExecuting(true)
    try {
      await onExecuteDeleteRule(labelName, deleteRule.delayDays)
    } finally {
      setExecuting(false)
    }
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ fontSize: '2.625rem', py: 3 }}>
        {deleteRule ? '削除ルール編集' : '削除ルール追加'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={4} sx={{ mt: 2 }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.95rem' }}>
            ラベル: <strong>{labelName}</strong>
          </Typography>

          <Stack direction="row" spacing={3} alignItems="center">
            <TextField
              type="number"
              value={editDaysStr}
              onChange={(e) => setEditDaysStr(e.target.value)}
              inputProps={{ min: 1, style: { fontSize: '1.95rem' } }}
              sx={{
                width: 180,
                '& .MuiInputBase-root': { height: 75 }
              }}
            />
            <Typography variant="h6" sx={{ fontSize: '1.95rem' }}>日後に自動削除</Typography>
          </Stack>

          {deleteRule && (
            <Stack direction="row" spacing={3} alignItems="center">
              <Switch
                checked={deleteRule.enabled}
                onChange={handleToggle}
                sx={{
                  transform: 'scale(1.5)',
                  '& .MuiSwitch-switchBase': {
                    '&.Mui-checked': {
                      transform: 'translateX(28px)',
                    },
                  },
                  '& .MuiSwitch-thumb': {
                    width: 28,
                    height: 28,
                  },
                  '& .MuiSwitch-track': {
                    height: 32,
                  },
                }}
              />
              <Typography variant="h6" sx={{ fontSize: '1.95rem' }}>
                {deleteRule.enabled ? '有効' : '無効'}
              </Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, gap: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ fontSize: '1.8rem', minHeight: 72, px: 4 }}
        >
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ fontSize: '1.8rem', minHeight: 72, px: 4 }}
        >
          {deleteRule ? '更新' : '追加'}
        </Button>
        {deleteRule && (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleExecute}
              disabled={executing || !deleteRule.enabled}
              startIcon={<PlayArrowIcon sx={{ fontSize: '2.25rem' }} />}
              sx={{ fontSize: '1.8rem', minHeight: 72, px: 4 }}
            >
              実行
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleRemove}
              sx={{ fontSize: '1.8rem', minHeight: 72, px: 4 }}
            >
              削除
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
