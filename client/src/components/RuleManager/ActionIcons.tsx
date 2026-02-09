import { Box, Tooltip } from '@mui/material'
import {
  Archive as ArchiveIcon,
  Drafts as DraftsIcon,
  StarBorder as StarBorderIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material'
import type { FilterEntry } from '../../types'

interface ActionIconsProps {
  action: FilterEntry['action']
  size?: 'small' | 'medium' | 'large'
}

const SIZE_CONFIG = {
  small: { icon: '1.5rem', slot: 30 },
  medium: { icon: '2.625rem', slot: 54 },
  large: { icon: '3.75rem', slot: 72 },
} as const

interface IconSlotProps {
  visible: boolean
  title: string
  icon: React.ReactElement
  slotSize: number
}

function IconSlot({ visible, title, icon, slotSize }: IconSlotProps) {
  return (
    <Box sx={{ width: slotSize, height: slotSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {visible && (
        <Tooltip title={title}>
          {icon}
        </Tooltip>
      )}
    </Box>
  )
}

/**
 * フィルタのアクションをアイコンで表示
 */
export function ActionIcons({ action, size = 'small' }: ActionIconsProps) {
  const { icon: iconSize, slot: slotSize } = SIZE_CONFIG[size]

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <IconSlot
        visible={!!action.shouldMarkAsRead}
        title="既読にする"
        icon={<DraftsIcon sx={{ fontSize: iconSize, color: 'primary.main' }} />}
        slotSize={slotSize}
      />
      <IconSlot
        visible={!!action.shouldNeverSpam}
        title="迷惑メールにしない"
        icon={<VerifiedUserIcon sx={{ fontSize: iconSize, color: 'success.main' }} />}
        slotSize={slotSize}
      />
      <IconSlot
        visible={!!action.shouldArchive}
        title="アーカイブ"
        icon={<ArchiveIcon sx={{ fontSize: iconSize, color: 'info.main' }} />}
        slotSize={slotSize}
      />
      <IconSlot
        visible={!!action.shouldNeverMarkAsImportant}
        title="重要にしない"
        icon={<StarBorderIcon sx={{ fontSize: iconSize, color: 'warning.main' }} />}
        slotSize={slotSize}
      />
    </Box>
  )
}
