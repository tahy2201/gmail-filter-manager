import {
  Box, Button, Collapse, FormControl, IconButton, InputAdornment, InputLabel,
  MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material'
import { Add as AddIcon, Search as SearchIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'
import { DeleteSchedule } from '../DeleteSchedule'

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
}

export function ToolbarLayout({
  isMobile, search, onSearchChange, labelFilter, onLabelFilterChange,
  labelOptions, filterCount, isSearchExpanded, onToggleSearch, onCreateNew,
}: ToolbarLayoutProps) {
  const searchField = (
    <TextField
      size="small"
      placeholder="検索..."
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      {...(isMobile ? { fullWidth: true } : { sx: { width: 150 } })}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
    />
  )

  const labelSelect = (
    <FormControl size="small" sx={isMobile ? { flex: 1 } : { minWidth: 120 }}>
      <InputLabel id="label-filter-label">ラベル</InputLabel>
      <Select
        labelId="label-filter-label"
        value={labelFilter}
        onChange={(e) => onLabelFilterChange(e.target.value)}
        label="ラベル"
      >
        <MenuItem value="">すべて</MenuItem>
        {labelOptions.map((l) => (
          <MenuItem key={l} value={l}>{l}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  const countLabel = (
    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
      {filterCount}
    </Typography>
  )

  const newButton = (
    <Button
      variant="contained"
      size="small"
      startIcon={<AddIcon />}
      onClick={onCreateNew}
      sx={isMobile ? { flex: 1 } : undefined}
    >
      新規
    </Button>
  )

  const deleteScheduleBox = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: isMobile ? 1.5 : 1,
        py: 0.5,
        bgcolor: 'grey.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200',
        ...(isMobile && { flex: 1, justifyContent: 'center' }),
      }}
    >
      <DeleteSchedule />
    </Box>
  )

  if (isMobile) {
    return (
      <Stack direction="column" spacing={1} sx={{ mb: 1, width: '100%' }}>
        <Collapse in={isSearchExpanded}>
          <Stack spacing={1.5} sx={{ mb: 1 }}>
            {searchField}
            <Stack direction="row" spacing={1} alignItems="center">
              {labelSelect}
              {countLabel}
            </Stack>
          </Stack>
        </Collapse>
        <Stack direction="row" spacing={1} alignItems="center">
          {newButton}
          {deleteScheduleBox}
          <IconButton
            size="small"
            onClick={onToggleSearch}
            sx={{
              bgcolor: isSearchExpanded ? 'primary.main' : 'grey.100',
              color: isSearchExpanded ? 'white' : 'text.secondary',
              '&:hover': {
                bgcolor: isSearchExpanded ? 'primary.dark' : 'grey.200',
              },
            }}
          >
            {isSearchExpanded ? <ExpandLessIcon /> : <SearchIcon />}
          </IconButton>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1, width: '100%' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        {searchField}
        {labelSelect}
        {countLabel}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        {newButton}
        {deleteScheduleBox}
      </Stack>
    </Stack>
  )
}
