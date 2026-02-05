/**
 * Filter Utilities
 * フィルタ関連のユーティリティ関数（純粋関数のみ）
 */

/**
 * Gmail フィルタ XML をパース
 * @param {string} xml - XML 文字列
 * @returns {Array} フィルタ一覧
 */
function parseFiltersXml(xml) {
  const doc = XmlService.parse(xml)
  const root = doc.getRootElement()
  const ns = root.getNamespace()
  const appsNs = XmlService.getNamespace('apps', 'http://schemas.google.com/apps/2006')

  const entries = root.getChildren('entry', ns)
  const filters = []

  for (const entry of entries) {
    const id = entry.getChildText('id', ns) || ''
    const properties = entry.getChildren('property', appsNs)

    const filter = {
      id: id,
      criteria: {},
      action: {}
    }

    for (const prop of properties) {
      const name = prop.getAttribute('name').getValue()
      const value = prop.getAttribute('value').getValue()

      switch (name) {
        case 'from':
          filter.criteria.from = value
          break
        case 'to':
          filter.criteria.to = value
          break
        case 'subject':
          filter.criteria.subject = value
          break
        case 'hasTheWord':
          filter.criteria.hasTheWord = value
          break
        case 'doesNotHaveTheWord':
          filter.criteria.doesNotHaveTheWord = value
          break
        case 'label':
          filter.action.label = value
          break
        case 'shouldArchive':
          filter.action.shouldArchive = value === 'true'
          break
        case 'shouldMarkAsRead':
          filter.action.shouldMarkAsRead = value === 'true'
          break
        case 'shouldNeverSpam':
          filter.action.shouldNeverSpam = value === 'true'
          break
        case 'shouldNeverMarkAsImportant':
          filter.action.shouldNeverMarkAsImportant = value === 'true'
          break
        case 'forwardTo':
          filter.action.forwardTo = value
          break
      }
    }

    filters.push(filter)
  }

  return filters
}

/**
 * フィルタ条件から Gmail 検索クエリを構築
 * @param {Object} criteria - フィルタ条件
 * @returns {string} Gmail 検索クエリ
 */
function buildSearchQuery(criteria) {
  const parts = []

  if (criteria.from) {
    parts.push(`from:(${criteria.from})`)
  }
  if (criteria.to) {
    parts.push(`to:(${criteria.to})`)
  }
  if (criteria.subject) {
    parts.push(`subject:(${criteria.subject})`)
  }
  if (criteria.hasTheWord) {
    parts.push(`(${criteria.hasTheWord})`)
  }
  if (criteria.doesNotHaveTheWord) {
    parts.push(`-(${criteria.doesNotHaveTheWord})`)
  }

  return parts.join(' ')
}
