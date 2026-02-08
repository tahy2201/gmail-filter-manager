import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          width: isMobile ? '100%' : 'auto',
          maxWidth: isMobile ? '100%' : '600px',
          m: isMobile ? 0 : 2,
          height: isMobile ? '100%' : 'auto',
          maxHeight: isMobile ? '100%' : 'calc(100% - 64px)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          py: isMobile ? 1.5 : 2,
          px: isMobile ? 2 : 3,
        }}
      >
        {title}
        <IconButton
          aria-label="閉じる"
          onClick={onClose}
          size={isMobile ? 'medium' : 'small'}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: isMobile ? 1.5 : 3,
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}
