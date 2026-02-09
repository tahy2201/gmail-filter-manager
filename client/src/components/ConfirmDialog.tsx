import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material'

interface Props {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = '削除',
  cancelLabel = 'キャンセル',
}: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          m: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.25rem',
          py: isMobile ? 1.5 : 2,
          px: isMobile ? 2 : 3,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent
        sx={{
          py: isMobile ? 1 : 2,
          px: isMobile ? 2 : 3,
        }}
      >
        <DialogContentText
          sx={{
            fontSize: isMobile ? '1.1rem' : '1rem',
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          p: isMobile ? 1.5 : 2,
          gap: isMobile ? 1.5 : 1,
          flexDirection: isMobile ? 'column' : 'row',
          '& > button': {
            width: isMobile ? '100%' : 'auto',
          },
        }}
      >
        <Button
          onClick={onCancel}
          color="inherit"
          sx={{
            fontSize: isMobile ? '1.1rem' : '1rem',
            minHeight: isMobile ? 48 : 36,
            px: 3,
            order: isMobile ? 2 : 1,
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          sx={{
            fontSize: isMobile ? '1.1rem' : '1rem',
            minHeight: isMobile ? 48 : 36,
            px: 3,
            order: isMobile ? 1 : 2,
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
