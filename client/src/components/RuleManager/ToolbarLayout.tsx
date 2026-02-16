import {
  Button, Collapse, FormControl, IconButton, InputAdornment, InputLabel,
  MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material'
import { Add as AddIcon, ContentCopy as ContentCopyIcon, Label as LabelIcon, OpenInNew as OpenInNewIcon, Search as SearchIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'

const UNLABELED_QUERY = 'has:nouserlabels -in:sent -in:drafts'

interface ToolbarLayoutProps {
  isMobile: boolean
  search: string
  onSearchChange: (value: string) => void
  labelFilter: string
  onLabelFilterChange: (value: string) => void
  labelOptions: string[]
  filterCount: string
  isSearchExpanded: boolean
  onToggleSearch: () => void
  onCreateNew: () => void
  onOpenLabelManager: () => void
}

export function ToolbarLayout({
  isMobile, search, onSearchChange, labelFilter, onLabelFilterChange,
  labelOptions, filterCount, isSearchExpanded, onToggleSearch, onCreateNew,
  onOpenLabelManager,
}: ToolbarLayoutProps) {
  const flex1 = isMobile ? { flex: 1 } : undefined

  function handleUnlabeledQuery() {
    if (isMobile) {
      navigator.clipboard.writeText(UNLABELED_QUERY)
    } else {
      window.open(`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(UNLABELED_QUERY)}`, '_blank')
    }
  }

  const buttons = (
    <>
      <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onCreateNew} sx={flex1}>
        新規
      </Button>
      <Button variant="outlined" size="small" startIcon={<LabelIcon />} onClick={onOpenLabelManager} sx={flex1}>
        ラベル
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={isMobile ? <ContentCopyIcon /> : <OpenInNewIcon />}
        onClick={handleUnlabeledQuery}
        sx={flex1}
      >
        ラベルなし
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <Stack spacing={1} sx={{ mb: 1 }}>
        <Collapse in={isSearchExpanded}>
          <Stack spacing={1.5} sx={{ mb: 1 }}>
            <TextField
              size="small"
              placeholder="検索..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> } }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel id="label-filter-label">ラベル</InputLabel>
                <Select labelId="label-filter-label" value={labelFilter} onChange={(e) => onLabelFilterChange(e.target.value)} label="ラベル">
                  <MenuItem value="">すべて</MenuItem>
                  {labelOptions.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{filterCount}</Typography>
            </Stack>
          </Stack>
        </Collapse>
        <Stack direction="row" spacing={1} alignItems="center">
          {buttons}
          <IconButton
            size="small"
            onClick={onToggleSearch}
            sx={{
              bgcolor: isSearchExpanded ? 'primary.main' : 'grey.100',
              color: isSearchExpanded ? 'white' : 'text.secondary',
              '&:hover': { bgcolor: isSearchExpanded ? 'primary.dark' : 'grey.200' },
            }}
          >
            {isSearchExpanded ? <ExpandLessIcon /> : <SearchIcon />}
          </IconButton>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          size="small"
          placeholder="検索..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 150 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="label-filter-label">ラベル</InputLabel>
          <Select labelId="label-filter-label" value={labelFilter} onChange={(e) => onLabelFilterChange(e.target.value)} label="ラベル">
            <MenuItem value="">すべて</MenuItem>
            {labelOptions.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{filterCount}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        {buttons}
      </Stack>
    </Stack>
  )
}
