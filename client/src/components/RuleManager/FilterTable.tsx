import { useEffect, useRef, useState } from 'react'
import {
  Box, Button, Chip, IconButton, Paper, Popover, Stack, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material'
import {
  Add as AddIcon, Archive as ArchiveIcon, Delete as DeleteIcon, Drafts as DraftsIcon,
  Edit as EditIcon, ForwardToInbox as ForwardToInboxIcon, PlayArrow as PlayArrowIcon,
  StarBorder as StarBorderIcon, VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material'
import type { DeleteRule, FilterEntry, LabelGroupData } from '../../types'

interface ColumnWidths {
  label: number
  from: number
  subject: number
  other: number
  action: number
  forward: number
  operations: number
  deleteRule: number
}

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  label: 140, from: 180, subject: 150, other: 180, action: 90, forward: 50, operations: 80, deleteRule: 80,
}

const COLUMN_WIDTHS_STORAGE_KEY = 'gmail-filter-manager-column-widths'

function loadColumnWidths(): ColumnWidths {
  try {
    const saved = localStorage.getItem(COLUMN_WIDTHS_STORAGE_KEY)
    if (saved) return { ...DEFAULT_COLUMN_WIDTHS, ...JSON.parse(saved) }
  } catch {}
  return DEFAULT_COLUMN_WIDTHS
}

function saveColumnWidths(widths: ColumnWidths): void {
  try {
    localStorage.setItem(COLUMN_WIDTHS_STORAGE_KEY, JSON.stringify(widths))
  } catch {}
}

interface ResizableHeaderCellProps {
  width: number
  onResize: (width: number) => void
  children: React.ReactNode
  minWidth?: number
}

function ResizableHeaderCell({ width, onResize, children, minWidth = 50 }: ResizableHeaderCellProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef({ startX: 0, startWidth: width })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragState.current = { startX: e.clientX, startWidth: width }
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - dragState.current.startX
      const newWidth = Math.max(minWidth, dragState.current.startWidth + diff)
      onResize(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, minWidth, onResize])

  return (
    <TableCell
      sx={{
        fontWeight: 'bold', bgcolor: 'grey.100', width, minWidth: width, maxWidth: width,
        position: 'sticky', top: 0, zIndex: 2, whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        borderRight: '2px solid', borderRightColor: 'divider', pr: 2,
      }}
    >
      {children}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: 'col-resize',
          bgcolor: isDragging ? 'primary.main' : 'transparent',
          '&:hover': {
            bgcolor: 'primary.light',
          },
          zIndex: 10,
        }}
      />
    </TableCell>
  )
}

interface FilterTableProps {
  labelGroups: LabelGroupData[]
  onEditFilter?: (filter: FilterEntry) => void
  onDeleteFilter?: (filterId: string) => void
  onUpdateDeleteRule?: (labelName: string, rule: DeleteRule | null) => void
  onExecuteDeleteRule?: (labelName: string, days: number) => Promise<number>
}

function parseConditionItems(v: string): string[] {
  const prefixMatch = v.match(/^(\w+):\{(.+)\}$/)
  if (prefixMatch) return prefixMatch[2].split(/\s+/).filter(Boolean)

  const braceMatch = v.match(/^\{(.+)\}$/)
  if (braceMatch) return braceMatch[1].split(/\s+/).filter(Boolean)

  if (v.includes('|')) return v.split('|').map((s) => s.trim()).filter(Boolean)
  return [v]
}

const ICON_SLOT_SX = { width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }

function ActionIcons({ action }: { action: FilterEntry['action'] }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.25 }}>
      <Box sx={ICON_SLOT_SX}>
        {action.shouldMarkAsRead && (
          <Tooltip title="既読にする"><DraftsIcon fontSize="small" sx={{ color: 'primary.main' }} /></Tooltip>
        )}
      </Box>
      <Box sx={ICON_SLOT_SX}>
        {action.shouldNeverSpam && (
          <Tooltip title="迷惑メールにしない"><VerifiedUserIcon fontSize="small" sx={{ color: 'success.main' }} /></Tooltip>
        )}
      </Box>
      <Box sx={ICON_SLOT_SX}>
        {action.shouldArchive && (
          <Tooltip title="アーカイブ"><ArchiveIcon fontSize="small" sx={{ color: 'info.main' }} /></Tooltip>
        )}
      </Box>
      <Box sx={ICON_SLOT_SX}>
        {action.shouldNeverMarkAsImportant && (
          <Tooltip title="重要にしない"><StarBorderIcon fontSize="small" sx={{ color: 'warning.main' }} /></Tooltip>
        )}
      </Box>
    </Box>
  )
}

function ConditionItemDisplay({ label, value, color }: { label: string; value: string; color: string }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const items = parseConditionItems(value)

  if (items.length <= 1) {
    return (
      <Typography variant="caption" sx={{ color }}>
        {label}: {value.length > 25 ? `${value.slice(0, 25)}...` : value}
      </Typography>
    )
  }

  return (
    <>
      <Chip
        label={`${label}: ${items.length}件`}
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ cursor: 'pointer', height: 20, fontSize: '0.7rem', bgcolor: `${color}15`, color, '& .MuiChip-label': { px: 1 } }}
      />
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 1.5, maxWidth: 350 }}>
          <Typography variant="caption" sx={{ color, fontWeight: 'bold', mb: 1, display: 'block' }}>{label}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {items.map((item) => <Chip key={item} label={item} size="small" sx={{ fontSize: '0.7rem' }} />)}
          </Box>
        </Box>
      </Popover>
    </>
  )
}

interface DeleteRuleCellProps {
  deleteRule: DeleteRule | null
  rowSpan: number
  labelName: string
  onUpdateDeleteRule?: (labelName: string, rule: DeleteRule | null) => void
  onExecuteDeleteRule?: (labelName: string, days: number) => Promise<number>
}

function DeleteRuleCell({ deleteRule, rowSpan, labelName, onUpdateDeleteRule, onExecuteDeleteRule }: DeleteRuleCellProps) {
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
    onUpdateDeleteRule(labelName, { ...deleteRule, enabled: !deleteRule.enabled })
  }

  function handleSave() {
    if (!onUpdateDeleteRule) return
    onUpdateDeleteRule(labelName, { labelName, delayDays: Number(editDaysStr) || 1, enabled: deleteRule?.enabled ?? true })
    handleClose()
  }

  function handleRemove() {
    if (!onUpdateDeleteRule) return
    onUpdateDeleteRule(labelName, null)
    handleClose()
  }

  async function handleExecute() {
    if (!deleteRule || !onExecuteDeleteRule || executing) return
    setExecuting(true)
    handleClose()
    try {
      await onExecuteDeleteRule(labelName, deleteRule.delayDays)
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

export function FilterTable({
  labelGroups,
  onEditFilter,
  onDeleteFilter,
  onUpdateDeleteRule,
  onExecuteDeleteRule,
}: FilterTableProps) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(loadColumnWidths)

  function handleResize(column: keyof ColumnWidths) {
    return (width: number) => {
      setColumnWidths((prev) => {
        const newWidths = { ...prev, [column]: width }
        saveColumnWidths(newWidths)
        return newWidths
      })
    }
  }

  const rows: Array<{
    filter: FilterEntry
    labelName: string
    deleteRule: DeleteRule | null
    isFirstInGroup: boolean
    rowSpan: number
  }> = []

  for (const group of labelGroups) {
    if (group.filters.length === 0) continue
    const rowSpan = group.filters.length

    for (let i = 0; i < group.filters.length; i++) {
      rows.push({
        filter: group.filters[i],
        labelName: group.labelName,
        deleteRule: group.deleteRule,
        isFirstInGroup: i === 0,
        rowSpan,
      })
    }
  }

  if (rows.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">フィルタがありません</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} sx={{ height: '100%' }}>
      <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <ResizableHeaderCell width={columnWidths.label} onResize={handleResize('label')} minWidth={80}>
              ラベル
            </ResizableHeaderCell>
            <ResizableHeaderCell width={columnWidths.from} onResize={handleResize('from')} minWidth={80}>
              From
            </ResizableHeaderCell>
            <ResizableHeaderCell width={columnWidths.subject} onResize={handleResize('subject')} minWidth={60}>
              件名
            </ResizableHeaderCell>
            <ResizableHeaderCell width={columnWidths.other} onResize={handleResize('other')} minWidth={80}>
              その他
            </ResizableHeaderCell>
            <ResizableHeaderCell width={columnWidths.action} onResize={handleResize('action')} minWidth={60}>
              アクション
            </ResizableHeaderCell>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', width: 50, borderRight: '2px solid', borderRightColor: 'divider' }}>転送</TableCell>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', textAlign: 'center', width: 80, borderRight: '2px solid', borderRightColor: 'divider' }}>操作</TableCell>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', textAlign: 'center', width: 80 }}>削除</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.filter.id}
              hover
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
            >
              {row.isFirstInGroup && (
                <TableCell
                  rowSpan={row.rowSpan}
                  sx={{
                    fontWeight: 500,
                    color: 'primary.main',
                    verticalAlign: 'top',
                    pt: 1,
                    borderRight: '1px solid',
                    borderRightColor: 'divider',
                    width: columnWidths.label,
                    minWidth: columnWidths.label,
                    maxWidth: columnWidths.label,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {row.labelName}
                </TableCell>
              )}

              <TableCell sx={{
                fontSize: '0.8rem',
                width: columnWidths.from,
                minWidth: columnWidths.from,
                maxWidth: columnWidths.from,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {row.filter.criteria.from ? (
                  (() => {
                    const items = parseConditionItems(row.filter.criteria.from)
                    if (items.length <= 3) {
                      return items.join(' | ')
                    }
                    return `${items.length}件`
                  })()
                ) : (
                  <Typography component="span" color="text.disabled">-</Typography>
                )}
              </TableCell>

              <TableCell sx={{
                fontSize: '0.8rem',
                width: columnWidths.subject,
                minWidth: columnWidths.subject,
                maxWidth: columnWidths.subject,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {row.filter.criteria.subject ? (
                  (() => {
                    const items = parseConditionItems(row.filter.criteria.subject)
                    if (items.length <= 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {items.map((item, idx) => (
                            <span key={item}>
                              {item}
                              {idx < items.length - 1 && <span style={{ color: '#9aa0a6', margin: '0 4px' }}>|</span>}
                            </span>
                          ))}
                        </Box>
                      )
                    }
                    return `${items.length}件`
                  })()
                ) : (
                  <Typography component="span" color="text.disabled">-</Typography>
                )}
              </TableCell>

              <TableCell sx={{
                fontSize: '0.8rem',
                width: columnWidths.other,
                minWidth: columnWidths.other,
                maxWidth: columnWidths.other,
                overflow: 'hidden',
              }}>
                {(row.filter.criteria.hasTheWord || row.filter.criteria.doesNotHaveTheWord || row.filter.criteria.to) ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {row.filter.criteria.hasTheWord && (
                      <ConditionItemDisplay
                        label="含む"
                        value={row.filter.criteria.hasTheWord}
                        color="#2e7d32"
                      />
                    )}
                    {row.filter.criteria.doesNotHaveTheWord && (
                      <ConditionItemDisplay
                        label="除外"
                        value={row.filter.criteria.doesNotHaveTheWord}
                        color="#d32f2f"
                      />
                    )}
                    {row.filter.criteria.to && (
                      <ConditionItemDisplay
                        label="To"
                        value={row.filter.criteria.to}
                        color="#1976d2"
                      />
                    )}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.disabled">-</Typography>
                )}
              </TableCell>

              <TableCell sx={{
                textAlign: 'center',
                width: columnWidths.action,
                minWidth: columnWidths.action,
                maxWidth: columnWidths.action,
              }}>
                <ActionIcons action={row.filter.action} />
              </TableCell>

              <TableCell sx={{ fontSize: '0.8rem' }}>
                {row.filter.action.forwardTo ? (
                  <Tooltip title={row.filter.action.forwardTo}>
                    <ForwardToInboxIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                  </Tooltip>
                ) : (
                  <Typography color="text.disabled">-</Typography>
                )}
              </TableCell>

              <TableCell sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                  {onEditFilter && (
                    <Tooltip title="編集">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEditFilter(row.filter)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDeleteFilter && (
                    <Tooltip title="削除">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteFilter(row.filter.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>

              {row.isFirstInGroup && (
                <DeleteRuleCell
                  deleteRule={row.deleteRule}
                  rowSpan={row.rowSpan}
                  labelName={row.labelName}
                  onUpdateDeleteRule={onUpdateDeleteRule}
                  onExecuteDeleteRule={onExecuteDeleteRule}
                />
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
