import { useState } from 'react'
import { useSyncFilters } from '../hooks/useSyncFilters'
import type { FilterDiffItem } from '../types'

const styles = {
  container: {
    padding: '16px',
  },
  description: {
    marginBottom: '20px',
    color: '#5f6368',
    fontSize: '14px',
  },
  button: (variant: 'primary' | 'danger' | 'secondary') => {
    const colorMap = {
      primary: { bg: '#1a73e8', text: '#fff' },
      danger: { bg: '#ea4335', text: '#fff' },
      secondary: { bg: '#f1f3f4', text: '#5f6368' },
    }
    const colors = colorMap[variant]
    return {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold' as const,
      marginRight: '8px',
      backgroundColor: colors.bg,
      color: colors.text,
    }
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  summaryBox: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '20px',
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '14px',
  },
  summaryIcon: (type: 'keep' | 'create' | 'delete') => {
    const iconColorMap = {
      keep: '#34a853',
      create: '#1a73e8',
      delete: '#ea4335',
    }
    return {
      marginRight: '8px',
      fontSize: '16px',
      color: iconColorMap[type],
    }
  },
  filterList: {
    marginTop: '16px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
  },
  filterItem: {
    padding: '8px 12px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '13px',
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    marginTop: '16px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  error: {
    backgroundColor: '#fce8e6',
    color: '#c5221f',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '16px',
  },
  success: {
    backgroundColor: '#e6f4ea',
    color: '#137333',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '16px',
  },
  confirmDialog: {
    backgroundColor: '#fff8e1',
    border: '1px solid #f9a825',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '20px',
  },
  confirmText: {
    marginBottom: '12px',
    fontWeight: 'bold' as const,
  },
}

function generateFilterKey(filter: FilterDiffItem, prefix: string): string {
  return `${prefix}-${filter.gmailId || ''}-${filter.from || ''}-${filter.to || ''}-${filter.subject || ''}-${filter.hasTheWord || ''}-${filter.label || ''}`
}

function FilterItemDisplay({ filter }: { filter: FilterDiffItem }) {
  const parts: string[] = []
  if (filter.from) parts.push(`from: ${filter.from}`)
  if (filter.to) parts.push(`to: ${filter.to}`)
  if (filter.subject) parts.push(`subject: ${filter.subject}`)
  if (filter.hasTheWord) parts.push(`has: ${filter.hasTheWord}`)
  if (filter.label) parts.push(`-> ${filter.label}`)

  return <div style={styles.filterItem}>{parts.join(' | ') || '(empty)'}</div>
}

export function FilterSync() {
  const { preview, result, loading, error, fetchPreview, applyDiff, reset } =
    useSyncFilters()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleApply = async () => {
    setShowConfirm(false)
    await applyDiff()
  }

  return (
    <div style={styles.container}>
      <p style={styles.description}>
        Compare filters in your spreadsheet with Gmail and sync the differences.
        This will add new filters and remove outdated ones from Gmail.
      </p>

      <div>
        <button
          type="button"
          style={{
            ...styles.button('primary'),
            ...(loading ? styles.buttonDisabled : {}),
          }}
          onClick={fetchPreview}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Check Diff'}
        </button>

        {(preview || result) && (
          <button
            type="button"
            style={styles.button('secondary')}
            onClick={reset}
          >
            Reset
          </button>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {preview && (
        <>
          <div style={styles.summaryBox}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryIcon('keep')}>&#10003;</span>
              <span>To Keep: {preview.summary.keep} filters</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryIcon('create')}>&#43;</span>
              <span>To Create: {preview.summary.create} filters</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryIcon('delete')}>&#8722;</span>
              <span>To Delete: {preview.summary.delete} filters</span>
            </div>
          </div>

          {preview.toCreate.length > 0 && (
            <>
              <div style={styles.sectionTitle}>
                <span style={{ color: '#1a73e8' }}>&#43;</span> Filters to Create
              </div>
              <div style={styles.filterList}>
                {preview.toCreate.map((f) => (
                  <FilterItemDisplay
                    key={generateFilterKey(f, 'create')}
                    filter={f}
                  />
                ))}
              </div>
            </>
          )}

          {preview.toDelete.length > 0 && (
            <>
              <div style={styles.sectionTitle}>
                <span style={{ color: '#ea4335' }}>&#8722;</span> Filters to
                Delete
              </div>
              <div style={styles.filterList}>
                {preview.toDelete.map((f) => (
                  <FilterItemDisplay
                    key={generateFilterKey(f, 'delete')}
                    filter={f}
                  />
                ))}
              </div>
            </>
          )}

          {(preview.summary.create > 0 || preview.summary.delete > 0) &&
            !showConfirm && (
              <div style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  style={{
                    ...styles.button('danger'),
                    ...(loading ? styles.buttonDisabled : {}),
                  }}
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                >
                  Apply Changes
                </button>
              </div>
            )}

          {showConfirm && (
            <div style={styles.confirmDialog}>
              <div style={styles.confirmText}>
                Are you sure you want to apply these changes to Gmail?
              </div>
              <button
                type="button"
                style={{
                  ...styles.button('danger'),
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                onClick={handleApply}
                disabled={loading}
              >
                {loading ? 'Applying...' : 'Yes, Apply'}
              </button>
              <button
                type="button"
                style={styles.button('secondary')}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {preview.summary.create === 0 && preview.summary.delete === 0 && (
            <div style={styles.success}>
              Gmail filters are in sync with your spreadsheet!
            </div>
          )}
        </>
      )}

      {result && (
        <div style={styles.summaryBox}>
          <div style={styles.success}>
            <strong>Sync Complete!</strong>
            <br />
            Created: {result.created} | Deleted: {result.deleted} | Errors:{' '}
            {result.errors.length}
          </div>

          {result.errors.length > 0 && (
            <>
              <div style={{ ...styles.sectionTitle, color: '#c5221f' }}>
                Errors:
              </div>
              {result.errors.map((err) => (
                <div
                  key={`err-${err.action}-${err.filter.from || ''}-${err.filter.label || ''}-${err.error}`}
                  style={styles.error}
                >
                  [{err.action}] {err.error}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
