/**
 * 条件アイテムのパース
 * 例: "from:{foo bar}" → ['foo', 'bar']
 * 例: "{foo bar}" → ['foo', 'bar']
 * 例: "foo|bar" → ['foo', 'bar']
 * 例: "foo" → ['foo']
 */
export function parseConditionItems(v: string): string[] {
  const prefixMatch = v.match(/^(\w+):\{(.+)\}$/)
  if (prefixMatch) return prefixMatch[2].split(/\s+/).filter(Boolean)

  const braceMatch = v.match(/^\{(.+)\}$/)
  if (braceMatch) return braceMatch[1].split(/\s+/).filter(Boolean)

  if (v.includes('|')) return v.split('|').map((s) => s.trim()).filter(Boolean)
  return [v]
}