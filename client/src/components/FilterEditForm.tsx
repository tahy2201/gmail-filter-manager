import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { ContentCopy as ContentCopyIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material'
import type { FilterEntry, Label } from '../types'
import { buildGmailSearchUrl, buildSearchQuery } from '../utils/gmailUrl'

interface Props {
  filter?: FilterEntry
  labels: Label[]
  onSave: (filter: Omit<FilterEntry, 'id'> | FilterEntry, applyToExisting?: boolean) => void
  onCancel: () => void
  loading?: boolean
}

export function FilterEditForm({
  filter,
  labels,
  onSave,
  onCancel,
  loading,
}: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [from, setFrom] = useState(filter?.criteria.from || '')
  const [to, setTo] = useState(filter?.criteria.to || '')
  const [subject, setSubject] = useState(filter?.criteria.subject || '')
  const [hasTheWord, setHasTheWord] = useState(
    filter?.criteria.hasTheWord || '',
  )
  const [doesNotHaveTheWord, setDoesNotHaveTheWord] = useState(
    filter?.criteria.doesNotHaveTheWord || '',
  )
  const [label, setLabel] = useState(filter?.action.label || '')
  const [shouldArchive, setShouldArchive] = useState(
    filter?.action.shouldArchive || false,
  )
  const [shouldMarkAsRead, setShouldMarkAsRead] = useState(
    filter?.action.shouldMarkAsRead || false,
  )
  const [shouldNeverSpam, setShouldNeverSpam] = useState(
    filter?.action.shouldNeverSpam || false,
  )
  const [applyToExisting, setApplyToExisting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const userLabels = labels.filter((l) => l.type === 'user')

  const validate = (): boolean => {
    const hasCriteria = from || to || subject || hasTheWord || doesNotHaveTheWord
    if (!hasCriteria) {
      setValidationError('少なくとも1つの条件を入力してください')
      return false
    }

    const hasAction = label || shouldArchive || shouldMarkAsRead || shouldNeverSpam
    if (!hasAction) {
      setValidationError('ラベルまたはアクションを少なくとも1つ設定してください')
      return false
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const filterData: Omit<FilterEntry, 'id'> = {
      criteria: {
        ...(from && { from }),
        ...(to && { to }),
        ...(subject && { subject }),
        ...(hasTheWord && { hasTheWord }),
        ...(doesNotHaveTheWord && { doesNotHaveTheWord }),
      },
      action: {
        ...(label && { label }),
        ...(shouldArchive && { shouldArchive }),
        ...(shouldMarkAsRead && { shouldMarkAsRead }),
        ...(shouldNeverSpam && { shouldNeverSpam }),
      },
    }

    if (filter) {
      onSave({ ...filterData, id: filter.id }, applyToExisting)
    } else {
      onSave(filterData, applyToExisting)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={isMobile ? 2 : 3}>
        {validationError && <Alert severity="error">{validationError}</Alert>}

        {/* 条件セクション */}
        <Box>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
            条件 (Criteria)
          </Typography>

          <Stack spacing={isMobile ? 1.5 : 2} sx={{ mt: isMobile ? 1.5 : 2 }}>
            <TextField
              label="差出人 (From)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="例: newsletter@example.com"
              size="small"
              fullWidth
            />

            <TextField
              label="宛先 (To)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="例: me@example.com"
              size="small"
              fullWidth
            />

            <TextField
              label="件名 (Subject)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="例: [重要]"
              size="small"
              fullWidth
            />

            <TextField
              label="含むキーワード (Has the words)"
              value={hasTheWord}
              onChange={(e) => setHasTheWord(e.target.value)}
              placeholder="例: unsubscribe"
              size="small"
              fullWidth
            />

            <TextField
              label="含まないキーワード (Doesn't have)"
              value={doesNotHaveTheWord}
              onChange={(e) => setDoesNotHaveTheWord(e.target.value)}
              placeholder="例: urgent"
              size="small"
              fullWidth
            />
          </Stack>

          {isMobile ? (
            <Button
              variant="text"
              size="small"
              startIcon={<ContentCopyIcon />}
              disabled={!from && !to && !subject && !hasTheWord && !doesNotHaveTheWord}
              onClick={() => {
                const query = buildSearchQuery({ from, to, subject, hasTheWord, doesNotHaveTheWord })
                navigator.clipboard.writeText(query)
              }}
              sx={{ mt: 1, alignSelf: 'flex-start' }}
            >
              検索クエリをコピー
            </Button>
          ) : (
            <Button
              variant="text"
              size="small"
              startIcon={<OpenInNewIcon />}
              disabled={!from && !to && !subject && !hasTheWord && !doesNotHaveTheWord}
              onClick={() => {
                const url = buildGmailSearchUrl({ from, to, subject, hasTheWord, doesNotHaveTheWord })
                window.open(url, '_blank')
              }}
              sx={{ mt: 1, alignSelf: 'flex-start' }}
            >
              Gmailでテスト
            </Button>
          )}
        </Box>

        <Divider />

        {/* アクションセクション */}
        <Box>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
            アクション (Action)
          </Typography>

          <Stack spacing={isMobile ? 1.5 : 2} sx={{ mt: isMobile ? 1.5 : 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label-select-label">ラベルを付ける</InputLabel>
              <Select
                labelId="label-select-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                label="ラベルを付ける"
              >
                <MenuItem value="">ラベルなし</MenuItem>
                {userLabels.map((l) => (
                  <MenuItem key={l.id} value={l.name}>
                    {l.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldArchive}
                  onChange={(e) => setShouldArchive(e.target.checked)}
                />
              }
              label="受信トレイをスキップ（アーカイブ）"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldMarkAsRead}
                  onChange={(e) => setShouldMarkAsRead(e.target.checked)}
                />
              }
              label="既読にする"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldNeverSpam}
                  onChange={(e) => setShouldNeverSpam(e.target.checked)}
                />
              }
              label="迷惑メールにしない"
            />
          </Stack>
        </Box>

        {/* 既存メールへの適用オプション */}
        {label && (
          <Box sx={{ bgcolor: 'action.hover', p: isMobile ? 1.5 : 2, borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={applyToExisting}
                  onChange={(e) => setApplyToExisting(e.target.checked)}
                  color="warning"
                />
              }
              label="既存の一致するメールにもラベルを付与する"
            />
            {applyToExisting && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                ※ 条件に一致する既存メール（最大1000件）にラベルを適用します
              </Typography>
            )}
          </Box>
        )}

        {/* ボタン */}
        <Stack direction="row" spacing={isMobile ? 1.5 : 2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
