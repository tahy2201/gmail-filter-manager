import { useState } from 'react'
import {
  Box, Button, Card, CardActions, CardContent, Chip, IconButton,
  Stack, Tooltip, Typography,
} from '@mui/material'
import {
  Delete as DeleteIcon, Edit as EditIcon, ForwardToInbox as ForwardToInboxIcon,
} from '@mui/icons-material'
import type { DeleteRule, FilterEntry } from '../../types'
import { ActionIcons } from './ActionIcons'
import { parseConditionItems } from './utils'

interface FilterCardProps {
  filter: FilterEntry
  labelName: string
  deleteRule: DeleteRule | null
  onEdit?: (filter: FilterEntry) => void
  onDelete?: (filterId: string) => void
}

// React JSX Element型
type JSXElement = React.ReactElement
const columFontSize = '18px'
const valueFontSize = '16px'
const iconSize = '20px' 

/**
 * 複数アイテム表示（2件まで表示、それ以上は「他N件」ボタンで展開）
 */
function renderMultipleItems(value: string, maxDisplay: number = 2): JSXElement {
  const items = parseConditionItems(value)

  if (items.length === 1) {
    return <span style={{ fontSize: columFontSize }}>{items[0]}</span>
  }

  if (items.length <= maxDisplay) {
    return (
      <Box sx={{ display: 'inline-flex', flexWrap: 'wrap', fontSize: valueFontSize }}>
        {items.map((item, idx) => (
          <span key={item}>
            {item}
            {idx < items.length - 1 && <span style={{ color: '#9aa0a6', margin: '0 12px' }}>|</span>}
          </span>
        ))}
      </Box>
    )
  }

  // 3件以上の場合は展開可能に
  return <MultipleItemsExpandable items={items} maxDisplay={maxDisplay} />
}

function MultipleItemsExpandable({ items, maxDisplay }: { items: string[]; maxDisplay: number }) {
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <Box sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 1, fontSize: valueFontSize }}>
        {items.map((item, idx) => (
          <span key={item}>
            {item}
            {idx < items.length - 1 && <span style={{ color: '#9aa0a6', margin: '0 12px' }}>|</span>}
          </span>
        ))}
        <Button
          variant="text"
          onClick={() => setExpanded(false)}
          sx={{ minWidth: 'auto', px: 3, fontSize: valueFontSize, minHeight: 60 }}
        >
          閉じる
        </Button>
      </Box>
    )
  }

  const displayItems = items.slice(0, maxDisplay)
  const remaining = items.length - maxDisplay

  return (
    <Box sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', fontSize: valueFontSize }}>
      {displayItems.map((item, idx) => (
        <span key={item}>
          {item}
          {idx < displayItems.length - 1 && <span style={{ color: '#9aa0a6', margin: '0 12px' }}>|</span>}
        </span>
      ))}
      <Button
        variant="text"
        onClick={() => setExpanded(true)}
        sx={{ minWidth: 'auto', px: 3, fontSize: valueFontSize, minHeight: 60 }}
      >
        他{remaining}件
      </Button>
    </Box>
  )
}

/**
 * フィルタをカード形式で表示
 */
export function FilterCard({ filter, onEdit, onDelete }: FilterCardProps) {
  const { criteria, action } = filter

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: 1 }}>
        {/* 条件セクション */}
        <Box sx={{ mb: 1 }}>
          <Typography
            component="span"
            variant="h6"
            sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: columFontSize, mr: 2 }}
          >
            条件:
          </Typography>
          <Stack spacing={0} sx={{ mt: 1 }}>
            {criteria.from && (
              <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
                <Typography component="span" variant="body1" sx={{ fontWeight: 'bold', fontSize: valueFontSize }}>
                  From:
                </Typography>
                {renderMultipleItems(criteria.from)}
              </Box>
            )}
            {criteria.subject && (
              <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
                <Typography component="span" variant="body1" sx={{ fontWeight: 'bold', fontSize: valueFontSize }}>
                  件名:
                </Typography>
                {renderMultipleItems(criteria.subject)}
              </Box>
            )}
            {criteria.hasTheWord && (
              <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
                <Typography component="span" variant="body1" sx={{ fontWeight: 'bold', fontSize: valueFontSize, color: '#2e7d32' }}>
                  含む:
                </Typography>
                <Typography component="span" variant="body1" sx={{ fontSize: valueFontSize, color: '#2e7d32' }}>
                  {criteria.hasTheWord.length > 25 ? `${criteria.hasTheWord.slice(0, 25)}...` : criteria.hasTheWord}
                </Typography>
              </Box>
            )}
            {criteria.doesNotHaveTheWord && (
              <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
                <Typography component="span" variant="body1" sx={{ fontWeight: 'bold', fontSize: valueFontSize, color: '#d32f2f' }}>
                  除外:
                </Typography>
                <Typography component="span" variant="body1" sx={{ fontSize: valueFontSize, color: '#d32f2f' }}>
                  {criteria.doesNotHaveTheWord.length > 25 ? `${criteria.doesNotHaveTheWord.slice(0, 25)}...` : criteria.doesNotHaveTheWord}
                </Typography>
              </Box>
            )}
            {criteria.to && (
              <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
                <Typography component="span" variant="body1" sx={{ fontWeight: 'bold', fontSize: valueFontSize, color: '#1976d2' }}>
                  To:
                </Typography>
                <Typography component="span" variant="body1" sx={{ fontSize: valueFontSize, color: '#1976d2' }}>
                  {criteria.to.length > 25 ? `${criteria.to.slice(0, 25)}...` : criteria.to}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* アクションセクション */}
        <Box>
          <Typography
            component="span"
            variant="h6"
            sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: columFontSize, mr: 2 }}
          >
            アクション:
          </Typography>
          <Box sx={{ display: 'inline-flex', gap: 3, verticalAlign: 'bottom', flexWrap: 'wrap', mt: 1 }}>
            <ActionIcons action={action} />
            {action.forwardTo && (
              <Tooltip title={action.forwardTo}>
                <Chip
                  icon={<ForwardToInboxIcon sx={{ fontSize: iconSize }} />}
                  label="転送"
                  size="medium"
                  sx={{
                    bgcolor: '#f3e5f5',
                    color: '#7b1fa2',
                    fontSize: valueFontSize,
                    height: 'auto',
                    '& .MuiChip-label': { px: 3, py: 1 }
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        {onEdit && (
          <Tooltip title="編集">
            <IconButton
              color="primary"
              onClick={() => onEdit(filter)}
              sx={{ minWidth: 21, minHeight: 21 }}
            >
              <EditIcon sx={{ fontSize: iconSize }} />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="削除">
            <IconButton
              color="error"
              onClick={() => onDelete(filter.id)}
              sx={{ minWidth: 21, minHeight: 21 }}
            >
              <DeleteIcon sx={{ fontSize: iconSize }} />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  )
}
