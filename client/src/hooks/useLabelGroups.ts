import { useMemo } from 'react'
import type { DeleteRule, FilterEntry, LabelGroupData } from '../types'

interface UseLabelGroupsParams {
  filters: FilterEntry[]
  deleteRules: DeleteRule[]
}

export function useLabelGroups({
  filters,
  deleteRules,
}: UseLabelGroupsParams): LabelGroupData[] {
  return useMemo(() => {
    // ラベル名でグルーピング（labelId も保持）
    const groupMap = new Map<string, LabelGroupData>()

    // フィルタをグルーピング
    for (const filter of filters) {
      const label = filter.action.label || '(ラベルなし)'
      const labelId = filter.action.labelId || ''

      if (!groupMap.has(label)) {
        groupMap.set(label, {
          labelId,
          labelName: label,
          filters: [],
          deleteRule: null,
        })
      }

      const group = groupMap.get(label)
      if (group) {
        group.filters.push(filter)
        // labelId が空だった場合、後続のフィルタから補完
        if (!group.labelId && labelId) {
          group.labelId = labelId
        }
      }
    }

    // 削除ルールを labelId でマッピング
    for (const rule of deleteRules) {
      // labelId で一致するグループを検索
      let matched = false
      for (const group of groupMap.values()) {
        if (group.labelId && group.labelId === rule.labelId) {
          group.deleteRule = rule
          matched = true
          break
        }
      }

      if (!matched) {
        // 削除ルールだけ存在してフィルタがないラベル
        groupMap.set(rule.labelName, {
          labelId: rule.labelId,
          labelName: rule.labelName,
          filters: [],
          deleteRule: rule,
        })
      }
    }

    // ソートして配列で返す
    return Array.from(groupMap.values()).sort((a, b) =>
      a.labelName.localeCompare(b.labelName)
    )
  }, [filters, deleteRules])
}
