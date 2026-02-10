import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material'
import { useSpreadsheet } from '../hooks/useSpreadsheet'

export function SettingsPanel() {
  const { url, loading, saving, error, successMessage, updateSpreadsheetId, clearMessages } =
    useSpreadsheet()
  const [inputId, setInputId] = useState('')

  const handleUpdate = async () => {
    if (!inputId.trim()) return
    const success = await updateSpreadsheetId(inputId.trim())
    if (success) {
      setInputId('')
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          スプレッドシート設定
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          現在の参照先
        </Typography>
        {url ? (
          <Link href={url} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            {url}
            <OpenInNewIcon fontSize="small" />
          </Link>
        ) : (
          <Typography color="text.secondary">未設定</Typography>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            参照先を変更
          </Typography>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TextField
              size="small"
              placeholder="スプレッドシートID"
              value={inputId}
              onChange={(e) => {
                setInputId(e.target.value)
                clearMessages()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdate()
              }}
              disabled={saving}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={saving || !inputId.trim()}
            >
              {saving ? <CircularProgress size={20} /> : '更新'}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            スプレッドシートURLの /d/ と /edit の間の文字列がIDです
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        )}
      </Paper>
    </Stack>
  )
}
