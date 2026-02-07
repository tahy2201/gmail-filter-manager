import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { api as gasApi } from '../services'
import type { EmailPreview } from '../types'

export function UnlabeledEmails() {
  const [emails, setEmails] = useState<EmailPreview[] | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<EmailPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await gasApi.getUnfilteredEmails(50)
      setEmails(result)
      setSelectedEmail(result.length > 0 ? result[0] : null)
    } catch (e) {
      const errorMessage = e instanceof Error
        ? `エラー: ${e.message}`
        : 'ラベルなしメールの取得に失敗しました'
      setError(errorMessage)
      console.error('Failed to fetch unlabeled emails:', e)
    } finally {
      setLoading(false)
    }
  }

  // 初回マウント時に自動検索
  useEffect(() => {
    handleSearch()
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={loading}
          startIcon={<SearchIcon />}
        >
          {loading ? '検索中...' : '検索'}
        </Button>
        <Typography variant="body2" color="text.secondary">
          ユーザーラベルがついていないメールを検索します（送信済み・下書きは除外）
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      {emails !== null && (
        <>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {emails.length} 件のラベルなしメール
            </Typography>
          </Box>
          {emails.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                最近のメールにはすべてラベルが付与されています
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, flex: 1, overflow: 'hidden' }}>
              {/* 左側：メールリスト */}
              <Box sx={{ flex: '0 0 40%', minWidth: 0 }}>
                <Paper sx={{ height: '100%', overflow: 'auto' }}>
                  <List disablePadding>
                    {emails.map((email, idx) => (
                      <ListItem key={email.id} disablePadding divider={idx < emails.length - 1}>
                        <ListItemButton
                          selected={selectedEmail?.id === email.id}
                          onClick={() => setSelectedEmail(email)}
                          sx={{ py: 1.5 }}
                        >
                          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: selectedEmail?.id === email.id ? 'bold' : 'normal',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1,
                                }}
                              >
                                {email.subject || '(件名なし)'}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ flexShrink: 0, fontSize: '0.7rem' }}
                              >
                                {email.date}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {email.from}
                            </Typography>
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>

              {/* 右側：メール詳細 */}
              <Box sx={{ flex: '1 1 60%', minWidth: 0 }}>
                <Paper sx={{ height: '100%', overflow: 'auto' }}>
                  {selectedEmail ? (
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {selectedEmail.subject || '(件名なし)'}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Stack spacing={1} sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>送信者:</strong> {selectedEmail.from}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>日時:</strong> {selectedEmail.date}
                        </Typography>
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedEmail.snippet}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="text.secondary">
                        メールを選択してください
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
