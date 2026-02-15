import { useEffect, useState } from 'react'
import { Box, CircularProgress, FormControl, MenuItem, Select, Switch, Tooltip } from '@mui/material'
import { Schedule as ScheduleIcon } from '@mui/icons-material'
import { useTrigger } from '../../hooks/useTrigger'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function DeleteSchedule() {
  const { status, loading, saving, error, setupTrigger, removeTrigger } = useTrigger()
  const [selectedHour, setSelectedHour] = useState<number>(3)

  useEffect(() => {
    if (status.hour !== null && status.hour !== selectedHour) {
      setSelectedHour(status.hour)
    }
  }, [status.hour, selectedHour])

  async function handleToggleTrigger(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      await setupTrigger(selectedHour)
    } else {
      await removeTrigger()
    }
  }

  async function handleHourChange(hour: number) {
    setSelectedHour(hour)
    if (status.enabled) {
      await setupTrigger(hour)
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Tooltip title={error || '日次削除スケジュール'}>
        <ScheduleIcon fontSize="small" color={error ? 'error' : 'action'} sx={{ fontSize: 18, visibility: loading ? 'hidden' : 'visible' }} />
      </Tooltip>

      <Tooltip title={status.enabled ? 'スケジュールON' : 'スケジュールOFF'}>
        <Switch size="small" checked={status.enabled} onChange={handleToggleTrigger} disabled={loading || saving} sx={{ visibility: loading ? 'hidden' : 'visible' }} />
      </Tooltip>

      <FormControl size="small" sx={{ minWidth: 70 }}>
        <Select
          value={selectedHour}
          onChange={(e) => handleHourChange(Number(e.target.value))}
          disabled={loading || saving}
          sx={{ height: 28, visibility: loading ? 'hidden' : 'visible', '& .MuiSelect-select': { py: 0.25, fontSize: '0.8rem' } }}
        >
          {HOURS.map((h) => (
            <MenuItem key={h} value={h}>
              {String(h).padStart(2, '0')}:00
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {(loading || saving) && (
        <CircularProgress
          size={16}
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      )}
    </Box>
  )
}
