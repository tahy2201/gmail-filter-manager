import { useMemo } from 'react'
import { useMediaQuery } from '@mui/material'

export function useIsMobile(): boolean {
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)')
  const cannotHover = useMediaQuery('(hover: none)')

  return useMemo(
    () => hasCoarsePointer || cannotHover || navigator.maxTouchPoints > 0,
    [hasCoarsePointer, cannotHover],
  )
}
