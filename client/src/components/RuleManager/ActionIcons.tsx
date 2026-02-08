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

/**
 * フィルタのアクションをアイコンで表示
 * - 📧 既読 (shouldMarkAsRead)
 * - ✅ 迷惑メールにしない (shouldNeverSpam)
 * - 📁 アーカイブ (shouldArchive)
 * - ⭐ 重要にしない (shouldNeverMarkAsImportant)
 */
export function ActionIcons({ action, size = 'small' }: ActionIconsProps) {
  const iconSize = size === 'large' ? '3.75rem' : size === 'medium' ? '2.625rem' : '1.5rem'
  const slotSize = size === 'large' ? 72 : size === 'medium' ? 54 : 30

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <Box sx={{ width: slotSize, height: slotSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {action.shouldMarkAsRead && (
          <Tooltip title="既読にする">
            <DraftsIcon sx={{ fontSize: iconSize, color: 'primary.main' }} />
          </Tooltip>
        )}
      </Box>
      <Box sx={{ width: slotSize, height: slotSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {action.shouldNeverSpam && (
          <Tooltip title="迷惑メールにしない">
            <VerifiedUserIcon sx={{ fontSize: iconSize, color: 'success.main' }} />
          </Tooltip>
        )}
      </Box>
      <Box sx={{ width: slotSize, height: slotSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {action.shouldArchive && (
          <Tooltip title="アーカイブ">
            <ArchiveIcon sx={{ fontSize: iconSize, color: 'info.main' }} />
          </Tooltip>
        )}
      </Box>
      <Box sx={{ width: slotSize, height: slotSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {action.shouldNeverMarkAsImportant && (
          <Tooltip title="重要にしない">
            <StarBorderIcon sx={{ fontSize: iconSize, color: 'warning.main' }} />
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}
