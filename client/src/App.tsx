import { useState } from 'react'
import { Box, Container, CssBaseline, Tab, Tabs, ThemeProvider, Typography, createTheme } from '@mui/material'
import { HistoryPanel } from './components/HistoryPanel'
import { QueryTester } from './components/QueryTester'
import { RuleManager } from './components/RuleManager'
import { SettingsPanel } from './components/SettingsPanel'
import { UnlabeledEmails } from './components/UnlabeledEmails'

const theme = createTheme({
  palette: {
    primary: { main: '#1a73e8' },
    secondary: { main: '#5f6368' },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none' } } },
  },
})

function TabPanel({ children, value, index }: { children?: React.ReactNode; index: number; value: number }) {
  if (value !== index) return null
  return (
    <Box role="tabpanel" id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} sx={{ py: 2 }}>
      {children}
    </Box>
  )
}

function App() {
  const [tabValue, setTabValue] = useState(0)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
          Gmail フィルタ管理
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} aria-label="フィルタ管理タブ">
            <Tab label="ルール管理" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="クエリテスト" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="ラベルなし" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="履歴" id="tab-3" aria-controls="tabpanel-3" />
            <Tab label="設定" id="tab-4" aria-controls="tabpanel-4" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <RuleManager />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <QueryTester />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <UnlabeledEmails />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <HistoryPanel />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <SettingsPanel />
        </TabPanel>
      </Container>
    </ThemeProvider>
  )
}

export default App
