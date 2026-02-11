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
    // labelId → グループの逆引きインデックス（削除ルールのマッチング用）
    const labelIdIndex = new Map<string, LabelGroupData>()

    // フィルタをグルーピング
    for (const filter of filters) {
      const label = filter.action.label || '(ラベルなし)'
      const labelId = filter.action.labelId || ''

      let group = groupMap.get(label)
      if (!group) {
        group = { labelId, labelName: label, filters: [], deleteRule: null }
        groupMap.set(label, group)
      }

      group.filters.push(filter)
      // labelId が空だった場合、後続のフィルタから補完
      if (!group.labelId && labelId) {
        group.labelId = labelId
      }
      if (group.labelId) {
        labelIdIndex.set(group.labelId, group)
      }
    }

    // 削除ルールを labelId でマッピング
    for (const rule of deleteRules) {
      const group = labelIdIndex.get(rule.labelId)
      if (group) {
        group.deleteRule = rule
      } else {
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
      a.labelName.localeCompare(b.labelName),
    )
  }, [filters, deleteRules])
}
