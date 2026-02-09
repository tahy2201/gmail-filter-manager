import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { api as gasApi } from '../services'
import type { EmailPreview } from '../types'

export function QueryTester() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EmailPreview[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const emails = await gasApi.searchEmails(query, 50)
      setResults(emails)
    } catch (e) {
      setError(e instanceof Error ? e.message : '検索に失敗しました')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      {/* 検索フォーム */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Gmailの検索クエリを入力（例: from:example.com subject:請求書）"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            size="small"
            sx={{ fontFamily: 'monospace' }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            startIcon={<SearchIcon />}
          >
            {loading ? '検索中...' : '検索'}
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {/* 検索結果 */}
      {results !== null && (
        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
            <Typography variant="subtitle2">
              {results.length} 件の結果
            </Typography>
          </Box>
          {results.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                このクエリに一致するメールはありません
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {results.map((email, idx) => (
                <ListItem
                  key={email.id}
                  divider={idx < results.length - 1}
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <ListItemText
                    primary={email.subject || '(件名なし)'}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {email.from} - {email.date}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary" noWrap>
                          {email.snippet}
                        </Typography>
                      </>
                    }
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Stack>
  )
}
