import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { api as gasApi } from '../services'
import type { Label } from '../types'
import { ConfirmDialog } from './ConfirmDialog'

// Gmail API で使用可能な定義済みカラー（背景色 → テキスト色）
const GMAIL_LABEL_COLORS: { bg: string; text: string }[] = [
  { bg: '#000000', text: '#ffffff' },
  { bg: '#434343', text: '#ffffff' },
  { bg: '#666666', text: '#ffffff' },
  { bg: '#999999', text: '#ffffff' },
  { bg: '#cccccc', text: '#0d3472' },
  { bg: '#efefef', text: '#0d3472' },
  { bg: '#f3f3f3', text: '#0d3472' },
  { bg: '#ffffff', text: '#0d3472' },
  { bg: '#fb4c2f', text: '#ffffff' },
  { bg: '#ffad47', text: '#ffffff' },
  { bg: '#fad165', text: '#594c05' },
  { bg: '#16a766', text: '#ffffff' },
  { bg: '#43d692', text: '#094228' },
  { bg: '#4a86e8', text: '#ffffff' },
  { bg: '#a479e2', text: '#ffffff' },
  { bg: '#f691b3', text: '#7a2e0b' },
  { bg: '#f6c5be', text: '#7a2e0b' },
  { bg: '#ffe6c7', text: '#594c05' },
  { bg: '#fef1d1', text: '#594c05' },
  { bg: '#b9e4d0', text: '#094228' },
  { bg: '#c6f3de', text: '#094228' },
  { bg: '#c9daf8', text: '#0d3472' },
  { bg: '#e3d7ff', text: '#3d188e' },
  { bg: '#fcdee8', text: '#7a2e0b' },
  { bg: '#efa093', text: '#ffffff' },
  { bg: '#ffc8af', text: '#7a2e0b' },
  { bg: '#fdedc1', text: '#594c05' },
  { bg: '#b3efd3', text: '#094228' },
  { bg: '#a0eac9', text: '#094228' },
  { bg: '#a4c2f4', text: '#0d3472' },
  { bg: '#d0bcf1', text: '#3d188e' },
  { bg: '#fbc8d9', text: '#7a2e0b' },
  { bg: '#e66550', text: '#ffffff' },
  { bg: '#ffbc6b', text: '#594c05' },
  { bg: '#fcda83', text: '#594c05' },
  { bg: '#44b984', text: '#ffffff' },
  { bg: '#68dfa9', text: '#094228' },
  { bg: '#6d9eeb', text: '#ffffff' },
  { bg: '#b694e8', text: '#ffffff' },
  { bg: '#f7a7c0', text: '#7a2e0b' },
  { bg: '#cc3a21', text: '#ffffff' },
  { bg: '#eaa041', text: '#ffffff' },
  { bg: '#f2c960', text: '#594c05' },
  { bg: '#149e60', text: '#ffffff' },
  { bg: '#3dc789', text: '#094228' },
  { bg: '#3c78d8', text: '#ffffff' },
  { bg: '#8e63ce', text: '#ffffff' },
  { bg: '#e07798', text: '#ffffff' },
  { bg: '#ac2b16', text: '#ffffff' },
  { bg: '#cf8933', text: '#ffffff' },
  { bg: '#d5ae49', text: '#ffffff' },
  { bg: '#0b804b', text: '#ffffff' },
  { bg: '#2a9c68', text: '#ffffff' },
  { bg: '#285bac', text: '#ffffff' },
  { bg: '#653e9b', text: '#ffffff' },
  { bg: '#b65775', text: '#ffffff' },
  { bg: '#822111', text: '#ffffff' },
  { bg: '#a46a21', text: '#ffffff' },
  { bg: '#aa8831', text: '#ffffff' },
  { bg: '#076239', text: '#ffffff' },
  { bg: '#1a764d', text: '#ffffff' },
  { bg: '#1c4587', text: '#ffffff' },
  { bg: '#41236d', text: '#ffffff' },
  { bg: '#83334c', text: '#ffffff' },
]

/** ネストレベルと表示名を算出 */
function getLabelDisplayInfo(name: string) {
  const parts = name.split('/')
  return {
    level: parts.length - 1,
    displayName: parts[parts.length - 1],
  }
}

/** ラベル名を親パスと末尾名に分割 */
function splitLabelName(fullName: string): { parent: string; leaf: string } {
  const lastSlash = fullName.lastIndexOf('/')
  if (lastSlash === -1) return { parent: '', leaf: fullName }
  return {
    parent: fullName.substring(0, lastSlash),
    leaf: fullName.substring(lastSlash + 1),
  }
}

/** フルラベル名を親パス + 末尾名から組み立て */
function buildLabelName(parent: string, leaf: string): string {
  return parent ? `${parent}/${leaf}` : leaf
}

interface Props {
  labels: Label[]
  saving: boolean
  onCreateLabel: (name: string) => Promise<boolean>
  onRenameLabel: (labelId: string, newName: string) => Promise<boolean>
  onDeleteLabel: (labelId: string) => Promise<boolean>
  onUpdateLabelColor: (
    labelId: string,
    backgroundColor: string,
    textColor: string,
  ) => Promise<boolean>
}

export function LabelManager({
  labels,
  saving,
  onCreateLabel,
  onRenameLabel,
  onDeleteLabel,
  onUpdateLabelColor,
}: Props) {
  const isMobile = useIsMobile()

  // 作成フォーム: 親ラベル + 末尾名
  const [newLeafName, setNewLeafName] = useState('')
  const [newParent, setNewParent] = useState('')

  // リネームフォーム: 親ラベル + 末尾名
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [editLeaf, setEditLeaf] = useState('')
  const [editParent, setEditParent] = useState('')

  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null)
  const [deletionImpact, setDeletionImpact] = useState<{
    filtersCount: number
    deleteRulesCount: number
    childLabelsCount: number
  } | null>(null)
  const [checkingImpact, setCheckingImpact] = useState(false)
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null)
  const [colorEditingLabelId, setColorEditingLabelId] = useState<string | null>(
    null,
  )

  const userLabels = labels.filter((l) => l.type === 'user')
  const systemLabels = labels.filter((l) => l.type === 'system')

  // 親ラベル候補（全ユーザーラベル名）
  const parentOptions = useMemo(
    () => userLabels.map((l) => l.name).sort(),
    [userLabels],
  )

  // 編集中のラベル自身とその子ラベルを親候補から除外
  const editParentOptions = useMemo(() => {
    if (!editingLabelId) return parentOptions
    const editingLabel = labels.find((l) => l.id === editingLabelId)
    if (!editingLabel) return parentOptions
    const editingName = editingLabel.name
    const editingPrefix = `${editingName}/`
    return parentOptions.filter(
      (name) => name !== editingName && !name.startsWith(editingPrefix),
    )
  }, [parentOptions, editingLabelId, labels])

  async function handleCreate() {
    const leaf = newLeafName.trim()
    if (!leaf) return
    const fullName = buildLabelName(newParent, leaf)
    const success = await onCreateLabel(fullName)
    if (success) {
      setNewLeafName('')
      setNewParent('')
    }
  }

  function startEditing(label: Label) {
    const { parent, leaf } = splitLabelName(label.name)
    setEditingLabelId(label.id)
    setEditLeaf(leaf)
    setEditParent(parent)
  }

  async function handleRename() {
    if (!editingLabelId) return
    const leaf = editLeaf.trim()
    if (!leaf) return
    const newFullName = buildLabelName(editParent, leaf)
    const success = await onRenameLabel(editingLabelId, newFullName)
    if (success) {
      setEditingLabelId(null)
      setEditLeaf('')
      setEditParent('')
    }
  }

  function cancelEditing() {
    setEditingLabelId(null)
    setEditLeaf('')
    setEditParent('')
  }

  async function handleDeleteClick(label: Label) {
    setDeletingLabel(label)
    setCheckingImpact(true)
    try {
      const impact = await gasApi.checkLabelDeletionImpact(label.id)
      setDeletionImpact(impact)
    } catch {
      setDeletionImpact({
        filtersCount: 0,
        deleteRulesCount: 0,
        childLabelsCount: 0,
      })
    } finally {
      setCheckingImpact(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingLabel) return
    const success = await onDeleteLabel(deletingLabel.id)
    if (success) {
      setDeletingLabel(null)
      setDeletionImpact(null)
    }
  }

  function handleColorClick(
    event: React.MouseEvent<HTMLElement>,
    labelId: string,
  ) {
    setColorAnchorEl(event.currentTarget)
    setColorEditingLabelId(labelId)
  }

  function handleColorClose() {
    setColorAnchorEl(null)
    setColorEditingLabelId(null)
  }

  async function handleColorSelect(bg: string, text: string) {
    if (!colorEditingLabelId) return
    await onUpdateLabelColor(colorEditingLabelId, bg, text)
    handleColorClose()
  }

  async function handleColorReset() {
    if (!colorEditingLabelId) return
    await onUpdateLabelColor(colorEditingLabelId, '', '')
    handleColorClose()
  }

  const currentColorLabel = colorEditingLabelId
    ? labels.find((l) => l.id === colorEditingLabelId)
    : null

  function buildDeleteMessage(): string {
    if (!deletingLabel) return ''
    const parts = [`ラベル「${deletingLabel.name}」を削除しますか？`]
    if (deletionImpact) {
      if (deletionImpact.childLabelsCount > 0) {
        parts.push(
          `${deletionImpact.childLabelsCount}個のサブラベルも削除されます。`,
        )
      }
      if (deletionImpact.filtersCount > 0) {
        parts.push(
          `このラベルを使用しているフィルタが${deletionImpact.filtersCount}件あります。`,
        )
      }
      if (deletionImpact.deleteRulesCount > 0) {
        parts.push(
          `関連する削除ルールが${deletionImpact.deleteRulesCount}件あり、同時に削除されます。`,
        )
      }
    }
    parts.push('この操作は取り消せません。')
    return parts.join('\n')
  }

  return (
    <Box>
      {/* 作成フォーム（スクロール時に上部固定） */}
      <Box
        sx={{
          position: 'sticky',
          top: isMobile ? -12 : -24,
          zIndex: 1,
          bgcolor: 'background.paper',
          pb: 2,
          mx: isMobile ? -1.5 : -3,
          px: isMobile ? 1.5 : 3,
          mt: isMobile ? -1.5 : -3,
          pt: isMobile ? 1.5 : 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={1}
          alignItems={isMobile ? 'stretch' : 'center'}
        >
          <FormControl size="small" sx={isMobile ? {} : { minWidth: 160 }}>
            <InputLabel id="create-parent-label">親ラベル</InputLabel>
            <Select
              labelId="create-parent-label"
              value={newParent}
              onChange={(e) => setNewParent(e.target.value)}
              label="親ラベル"
              disabled={saving}
            >
              <MenuItem value="">（なし）</MenuItem>
              {parentOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="ラベル名"
            value={newLeafName}
            onChange={(e) => setNewLeafName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
            disabled={saving}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AddIcon />
              )
            }
            onClick={handleCreate}
            disabled={!newLeafName.trim() || saving}
            sx={{ whiteSpace: 'nowrap' }}
          >
            作成
          </Button>
        </Stack>
      </Box>

      {/* ユーザーラベル一覧（階層表示） */}
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ mb: 0.5, mt: 2 }}
      >
        ユーザーラベル ({userLabels.length})
      </Typography>
      <List dense disablePadding>
        {userLabels.map((label) => {
          const { level, displayName } = getLabelDisplayInfo(label.name)
          return (
            <ListItem
              key={label.id}
              disableGutters
              sx={{
                py: 0.5,
                px: 1,
                pl: 1 + level * 3,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
              secondaryAction={
                editingLabelId === label.id ? (
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={handleRename}
                      disabled={saving || !editLeaf.trim()}
                    >
                      <CheckIcon fontSize="small" color="success" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="色を変更">
                      <IconButton
                        size="small"
                        onClick={(e) => handleColorClick(e, label.id)}
                      >
                        <PaletteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="リネーム">
                      <IconButton
                        size="small"
                        onClick={() => startEditing(label)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="削除">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(label)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )
              }
            >
              {editingLabelId === label.id ? (
                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  spacing={1}
                  alignItems={isMobile ? 'stretch' : 'center'}
                  sx={{ flex: 1, mr: 1 }}
                >
                  <FormControl
                    size="small"
                    sx={isMobile ? {} : { minWidth: 140 }}
                  >
                    <InputLabel id="edit-parent-label">親ラベル</InputLabel>
                    <Select
                      labelId="edit-parent-label"
                      value={editParent}
                      onChange={(e) => setEditParent(e.target.value)}
                      label="親ラベル"
                      disabled={saving}
                    >
                      <MenuItem value="">（なし）</MenuItem>
                      {editParentOptions.map((name) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    value={editLeaf}
                    onChange={(e) => setEditLeaf(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename()
                      if (e.key === 'Escape') cancelEditing()
                    }}
                    disabled={saving}
                    autoFocus
                    placeholder="ラベル名"
                    sx={{ flex: 1 }}
                  />
                </Stack>
              ) : (
                <ListItemText
                  primary={
                    <Chip
                      label={displayName}
                      size="small"
                      {...(label.color
                        ? {
                            sx: {
                              bgcolor: label.color.backgroundColor,
                              color: label.color.textColor,
                              fontWeight: 500,
                            },
                          }
                        : { variant: 'outlined' as const })}
                    />
                  }
                />
              )}
            </ListItem>
          )
        })}
        {userLabels.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 2, textAlign: 'center' }}
          >
            ユーザーラベルはありません
          </Typography>
        )}
      </List>

      {/* システムラベル */}
      {systemLabels.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography
            variant="subtitle2"
            color="text.disabled"
            sx={{ mb: 0.5 }}
          >
            システムラベル ({systemLabels.length})
          </Typography>
          <List dense disablePadding>
            {systemLabels.map((label) => (
              <ListItem key={label.id} disableGutters sx={{ py: 0.25, px: 1 }}>
                <ListItemText
                  primary={
                    <Chip
                      label={label.name}
                      size="small"
                      variant="outlined"
                      disabled
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* カラーパレットPopover */}
      <Popover
        open={!!colorAnchorEl}
        anchorEl={colorAnchorEl}
        onClose={handleColorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            ラベルの色を選択
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 0.5,
            }}
          >
            {GMAIL_LABEL_COLORS.map((color) => {
              const isSelected =
                currentColorLabel?.color?.backgroundColor === color.bg &&
                currentColorLabel?.color?.textColor === color.text

              let borderColor = 'transparent'
              if (isSelected) borderColor = 'primary.main'
              else if (color.bg === '#ffffff') borderColor = 'grey.300'

              return (
                <Box
                  key={`${color.bg}-${color.text}`}
                  onClick={() => handleColorSelect(color.bg, color.text)}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: color.bg,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid',
                    borderColor,
                    '&:hover': {
                      transform: 'scale(1.2)',
                      borderColor: 'primary.main',
                    },
                    transition: 'transform 0.1s, border-color 0.1s',
                  }}
                >
                  {isSelected && (
                    <CheckIcon sx={{ fontSize: 16, color: color.text }} />
                  )}
                </Box>
              )
            })}
          </Box>
          <Button
            size="small"
            onClick={handleColorReset}
            sx={{ mt: 1 }}
            fullWidth
            disabled={!currentColorLabel?.color}
          >
            色をリセット
          </Button>
        </Box>
      </Popover>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={!!deletingLabel}
        title="ラベルを削除"
        message={checkingImpact ? '影響を確認中...' : buildDeleteMessage()}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!saving) {
            setDeletingLabel(null)
            setDeletionImpact(null)
          }
        }}
        loading={saving || checkingImpact}
      />
    </Box>
  )
}
