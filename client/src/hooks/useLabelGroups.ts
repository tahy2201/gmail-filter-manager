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
    // ラベルの完全名（一番下の階層）でグルーピング
    const groupMap = new Map<string, LabelGroupData>()

    // フィルタをグルーピング
    for (const filter of filters) {
      const label = filter.action.label || '(ラベルなし)'

      if (!groupMap.has(label)) {
        groupMap.set(label, {
          labelName: label,
          filters: [],
          deleteRule: null,
        })
      }

      const group = groupMap.get(label)
      if (group) {
        group.filters.push(filter)
      }
    }

    // 削除ルールをマッピング
    for (const rule of deleteRules) {
      if (!groupMap.has(rule.labelName)) {
        // 削除ルールだけ存在してフィルタがないラベル
        groupMap.set(rule.labelName, {
          labelName: rule.labelName,
          filters: [],
          deleteRule: rule,
        })
      } else {
        const group = groupMap.get(rule.labelName)
        if (group) {
          group.deleteRule = rule
        }
      }
    }

    // ソートして配列で返す
    return Array.from(groupMap.values()).sort((a, b) =>
      a.labelName.localeCompare(b.labelName)
    )
  }, [filters, deleteRules])
}
