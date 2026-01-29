import { useState } from 'react'
import type { FilterEntry, Label } from '../types'

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#1a73e8',
    paddingBottom: '8px',
    borderBottom: '1px solid #e0e0e0',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  label: {
    fontSize: '13px',
    color: '#5f6368',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#202124',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  button: (variant: 'primary' | 'secondary') => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: '14px',
    backgroundColor: variant === 'primary' ? '#1a73e8' : '#f1f3f4',
    color: variant === 'primary' ? '#fff' : '#5f6368',
  }),
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fce8e6',
    color: '#c5221f',
    borderRadius: '4px',
    fontSize: '13px',
  },
}

interface Props {
  filter?: FilterEntry
  labels: Label[]
  onSave: (filter: Omit<FilterEntry, 'id'> | FilterEntry) => void
  onCancel: () => void
  loading?: boolean
}

export function FilterEditForm({
  filter,
  labels,
  onSave,
  onCancel,
  loading,
}: Props) {
  const [from, setFrom] = useState(filter?.criteria.from || '')
  const [to, setTo] = useState(filter?.criteria.to || '')
  const [subject, setSubject] = useState(filter?.criteria.subject || '')
  const [hasTheWord, setHasTheWord] = useState(
    filter?.criteria.hasTheWord || '',
  )
  const [doesNotHaveTheWord, setDoesNotHaveTheWord] = useState(
    filter?.criteria.doesNotHaveTheWord || '',
  )
  const [label, setLabel] = useState(filter?.action.label || '')
  const [shouldArchive, setShouldArchive] = useState(
    filter?.action.shouldArchive || false,
  )
  const [shouldMarkAsRead, setShouldMarkAsRead] = useState(
    filter?.action.shouldMarkAsRead || false,
  )
  const [shouldNeverSpam, setShouldNeverSpam] = useState(
    filter?.action.shouldNeverSpam || false,
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  const userLabels = labels.filter((l) => l.type === 'user')

  const validate = (): boolean => {
    const hasCriteria = from || to || subject || hasTheWord || doesNotHaveTheWord
    if (!hasCriteria) {
      setValidationError('少なくとも1つの条件を入力してください')
      return false
    }

    const hasAction = label || shouldArchive || shouldMarkAsRead || shouldNeverSpam
    if (!hasAction) {
      setValidationError('ラベルまたはアクションを少なくとも1つ設定してください')
      return false
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const filterData: Omit<FilterEntry, 'id'> = {
      criteria: {
        ...(from && { from }),
        ...(to && { to }),
        ...(subject && { subject }),
        ...(hasTheWord && { hasTheWord }),
        ...(doesNotHaveTheWord && { doesNotHaveTheWord }),
      },
      action: {
        ...(label && { label }),
        ...(shouldArchive && { shouldArchive }),
        ...(shouldMarkAsRead && { shouldMarkAsRead }),
        ...(shouldNeverSpam && { shouldNeverSpam }),
      },
    }

    if (filter) {
      onSave({ ...filterData, id: filter.id })
    } else {
      onSave(filterData)
    }
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      {validationError && <div style={styles.error}>{validationError}</div>}

      <div style={styles.section}>
        <div style={styles.sectionTitle}>条件 (Criteria)</div>

        <div style={styles.field}>
          <label style={styles.label} htmlFor="from">
            差出人 (From)
          </label>
          <input
            id="from"
            type="text"
            style={styles.input}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="例: newsletter@example.com"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label} htmlFor="to">
            宛先 (To)
          </label>
          <input
            id="to"
            type="text"
            style={styles.input}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="例: me@example.com"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label} htmlFor="subject">
            件名 (Subject)
          </label>
          <input
            id="subject"
            type="text"
            style={styles.input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="例: [重要]"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label} htmlFor="hasTheWord">
            含むキーワード (Has the words)
          </label>
          <input
            id="hasTheWord"
            type="text"
            style={styles.input}
            value={hasTheWord}
            onChange={(e) => setHasTheWord(e.target.value)}
            placeholder="例: unsubscribe"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label} htmlFor="doesNotHaveTheWord">
            含まないキーワード (Doesn't have)
          </label>
          <input
            id="doesNotHaveTheWord"
            type="text"
            style={styles.input}
            value={doesNotHaveTheWord}
            onChange={(e) => setDoesNotHaveTheWord(e.target.value)}
            placeholder="例: urgent"
          />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>アクション (Action)</div>

        <div style={styles.field}>
          <label style={styles.label} htmlFor="label">
            ラベルを付ける
          </label>
          <select
            id="label"
            style={styles.select}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          >
            <option value="">ラベルなし</option>
            {userLabels.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.checkboxRow}>
          <input
            type="checkbox"
            id="shouldArchive"
            style={styles.checkbox}
            checked={shouldArchive}
            onChange={(e) => setShouldArchive(e.target.checked)}
          />
          <label htmlFor="shouldArchive" style={styles.checkboxLabel}>
            受信トレイをスキップ（アーカイブ）
          </label>
        </div>

        <div style={styles.checkboxRow}>
          <input
            type="checkbox"
            id="shouldMarkAsRead"
            style={styles.checkbox}
            checked={shouldMarkAsRead}
            onChange={(e) => setShouldMarkAsRead(e.target.checked)}
          />
          <label htmlFor="shouldMarkAsRead" style={styles.checkboxLabel}>
            既読にする
          </label>
        </div>

        <div style={styles.checkboxRow}>
          <input
            type="checkbox"
            id="shouldNeverSpam"
            style={styles.checkbox}
            checked={shouldNeverSpam}
            onChange={(e) => setShouldNeverSpam(e.target.checked)}
          />
          <label htmlFor="shouldNeverSpam" style={styles.checkboxLabel}>
            迷惑メールにしない
          </label>
        </div>
      </div>

      <div style={styles.buttons}>
        <button
          type="button"
          style={styles.button('secondary')}
          onClick={onCancel}
          disabled={loading}
        >
          キャンセル
        </button>
        <button
          type="submit"
          style={{
            ...styles.button('primary'),
            ...(loading ? styles.buttonDisabled : {}),
          }}
          disabled={loading}
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}
