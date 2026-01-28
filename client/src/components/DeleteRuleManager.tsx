import { useState } from 'react'
import { useDeleteRules } from '../hooks/useDeleteRules'
import { useLabels } from '../hooks/useLabels'
import type { DeleteRule } from '../types'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  card: {
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#fff',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #f1f3f4',
  },
  label: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#202124',
  },
  days: {
    fontSize: '14px',
    color: '#5f6368',
    minWidth: '80px',
  },
  toggle: (enabled: boolean) => ({
    padding: '4px 12px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: enabled ? '#34a853' : '#dadce0',
    color: enabled ? '#fff' : '#5f6368',
  }),
  button: {
    padding: '6px 12px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#1a73e8',
    color: '#fff',
  },
  buttonDanger: {
    backgroundColor: '#ea4335',
  },
  addForm: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f1f3f4',
    borderRadius: '8px',
  },
  select: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px',
  },
  input: {
    width: '80px',
    padding: '8px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#5f6368',
  },
  error: {
    padding: '16px',
    backgroundColor: '#fce8e6',
    color: '#c5221f',
    borderRadius: '4px',
  },
  success: {
    padding: '12px',
    backgroundColor: '#e6f4ea',
    color: '#137333',
    borderRadius: '4px',
    fontSize: '14px',
  },
}

export function DeleteRuleManager() {
  const { rules, loading, error, saveRules, executeRule } = useDeleteRules()
  const { labels } = useLabels()
  const [newLabel, setNewLabel] = useState('')
  const [newDays, setNewDays] = useState(30)
  const [message, setMessage] = useState<string | null>(null)
  const [executing, setExecuting] = useState<string | null>(null)

  const handleToggle = async (index: number) => {
    const updated = [...rules]
    updated[index] = { ...updated[index], enabled: !updated[index].enabled }
    await saveRules(updated)
  }

  const handleDelete = async (index: number) => {
    const updated = rules.filter((_, i) => i !== index)
    await saveRules(updated)
  }

  const handleAdd = async () => {
    if (!newLabel) return
    const newRule: DeleteRule = {
      labelName: newLabel,
      delayDays: newDays,
      enabled: true,
    }
    await saveRules([...rules, newRule])
    setNewLabel('')
    setNewDays(30)
  }

  const handleExecute = async (rule: DeleteRule) => {
    setExecuting(rule.labelName)
    setMessage(null)
    const deleted = await executeRule(rule.labelName, rule.delayDays)
    if (deleted >= 0) {
      setMessage(`Deleted ${deleted} emails from "${rule.labelName}"`)
    }
    setExecuting(null)
  }

  if (loading) {
    return <div style={styles.loading}>Loading delete rules...</div>
  }

  if (error) {
    return <div style={styles.error}>{error}</div>
  }

  const userLabels = labels.filter((l) => l.type === 'user')

  return (
    <div style={styles.container}>
      {message && <div style={styles.success}>{message}</div>}

      <div style={styles.card}>
        <h3 style={{ marginBottom: '16px', color: '#1a73e8' }}>Delete Rules</h3>
        {rules.length === 0 ? (
          <div style={{ color: '#5f6368', padding: '16px 0' }}>
            No delete rules configured
          </div>
        ) : (
          rules.map((rule, index) => (
            <div key={rule.labelName} style={styles.row}>
              <div style={styles.label}>{rule.labelName}</div>
              <div style={styles.days}>{rule.delayDays} days</div>
              <button
                type="button"
                style={styles.toggle(rule.enabled)}
                onClick={() => handleToggle(index)}
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </button>
              <button
                type="button"
                style={styles.button}
                onClick={() => handleExecute(rule)}
                disabled={!rule.enabled || executing === rule.labelName}
              >
                {executing === rule.labelName ? 'Running...' : 'Run Now'}
              </button>
              <button
                type="button"
                style={{ ...styles.button, ...styles.buttonDanger }}
                onClick={() => handleDelete(index)}
              >
                Delete
              </button>
            </div>
          ))
        )}

        <div style={styles.addForm}>
          <select
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            style={styles.select}
          >
            <option value="">Select label...</option>
            {userLabels.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={newDays}
            onChange={(e) => setNewDays(Number(e.target.value))}
            min={1}
            style={styles.input}
            placeholder="Days"
          />
          <button
            type="button"
            style={styles.button}
            onClick={handleAdd}
            disabled={!newLabel}
          >
            Add Rule
          </button>
        </div>
      </div>
    </div>
  )
}
