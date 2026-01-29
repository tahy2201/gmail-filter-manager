const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '90%',
    padding: '24px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: '#202124',
    marginBottom: '12px',
  },
  message: {
    fontSize: '14px',
    color: '#5f6368',
    marginBottom: '20px',
    lineHeight: 1.5,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  button: (variant: 'danger' | 'secondary') => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: '14px',
    backgroundColor: variant === 'danger' ? '#ea4335' : '#f1f3f4',
    color: variant === 'danger' ? '#fff' : '#5f6368',
  }),
}

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
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.dialog}>
        <div style={styles.title}>{title}</div>
        <div style={styles.message}>{message}</div>
        <div style={styles.buttons}>
          <button
            type="button"
            style={styles.button('secondary')}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            style={styles.button('danger')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
