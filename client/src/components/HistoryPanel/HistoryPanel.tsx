import {
  Alert, Box, Chip, CircularProgress, IconButton, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material'
import { Refresh as RefreshIcon } from '@mui/icons-material'
import { useDeleteHistory } from '../../hooks/useDeleteHistory'

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

const ACTION_LABELS: Record<string, { label: string; color: ChipColor }> = {
  DELETE_EMAILS: { label: 'メール削除', color: 'warning' },
  SETUP_TRIGGER: { label: 'トリガー設定', color: 'info' },
  REMOVE_TRIGGER: { label: 'トリガー削除', color: 'default' },
  SAVE_DELETE_RULES: { label: 'ルール保存', color: 'success' },
  SAVE_FILTERS: { label: 'フィルタ保存', color: 'primary' },
}

function formatTimestamp(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch {
    return timestamp
  }
}

function getActionLabel(action: string): { label: string; color: ChipColor } {
  return ACTION_LABELS[action] ?? { label: action, color: 'default' }
}

export function HistoryPanel() {
  const { history, loading, error, refresh } = useDeleteHistory(100)

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) return <Alert severity="error">{error}</Alert>

  const headerCellSx = { fontWeight: 'bold', bgcolor: 'grey.100' }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">操作履歴</Typography>
        <Tooltip title="更新">
          <IconButton onClick={refresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {history.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">履歴がありません</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...headerCellSx, width: 180 }}>日時</TableCell>
                <TableCell sx={{ ...headerCellSx, width: 120 }}>アクション</TableCell>
                <TableCell sx={{ ...headerCellSx, width: 150 }}>対象</TableCell>
                <TableCell sx={headerCellSx}>詳細</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((entry, idx) => {
                const { label, color } = getActionLabel(entry.action)
                const uniqueKey = `${entry.timestamp}-${entry.action}-${entry.target}-${idx}`
                return (
                  <TableRow key={uniqueKey} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Chip label={label} size="small" color={color} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem' }}>{entry.target}</TableCell>
                    <TableCell sx={{ fontSize: '0.9rem' }}>{entry.details}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
