import { useState } from 'react';
import { gasApi } from '../services/gas';
import type { FilterEntry, EmailPreview } from '../types';

const styles = {
  card: {
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#1a73e8',
    marginBottom: '8px',
    wordBreak: 'break-word' as const,
  },
  criteriaSection: {
    marginBottom: '12px',
  },
  criteriaItem: {
    fontSize: '13px',
    color: '#3c4043',
    marginBottom: '4px',
  },
  criteriaKey: {
    color: '#5f6368',
    marginRight: '4px',
  },
  criteriaValue: {
    fontFamily: 'monospace',
    backgroundColor: '#f1f3f4',
    padding: '2px 4px',
    borderRadius: '2px',
    wordBreak: 'break-all' as const,
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
    marginBottom: '12px',
  },
  badge: (color: string) => ({
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '10px',
    backgroundColor: color,
    color: '#fff',
  }),
  button: {
    padding: '6px 12px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#f1f3f4',
    color: '#5f6368',
  },
  previewList: {
    marginTop: '12px',
    borderTop: '1px solid #e0e0e0',
    paddingTop: '12px',
  },
  previewItem: {
    fontSize: '12px',
    padding: '4px 0',
    borderBottom: '1px solid #f1f3f4',
  },
  previewSubject: {
    fontWeight: 'bold' as const,
    color: '#202124',
  },
  previewMeta: {
    color: '#5f6368',
  },
};

interface Props {
  filter: FilterEntry;
}

export function FilterCard({ filter }: Props) {
  const [previews, setPreviews] = useState<EmailPreview[] | null>(null);
  const [loading, setLoading] = useState(false);

  const buildQuery = () => {
    const parts: string[] = [];
    if (filter.criteria.from) parts.push(`from:(${filter.criteria.from})`);
    if (filter.criteria.to) parts.push(`to:(${filter.criteria.to})`);
    if (filter.criteria.subject) parts.push(`subject:(${filter.criteria.subject})`);
    if (filter.criteria.hasTheWord) parts.push(filter.criteria.hasTheWord);
    if (filter.criteria.doesNotHaveTheWord) {
      parts.push(`-{${filter.criteria.doesNotHaveTheWord}}`);
    }
    return parts.join(' ');
  };

  const handlePreview = async () => {
    const query = buildQuery();
    if (!query) return;

    setLoading(true);
    try {
      const emails = await gasApi.searchEmails(query, 5);
      setPreviews(emails);
    } catch {
      setPreviews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      {filter.action.label && (
        <div style={styles.label}>{filter.action.label}</div>
      )}

      <div style={styles.criteriaSection}>
        {filter.criteria.from && (
          <div style={styles.criteriaItem}>
            <span style={styles.criteriaKey}>From:</span>
            <span style={styles.criteriaValue}>{filter.criteria.from}</span>
          </div>
        )}
        {filter.criteria.to && (
          <div style={styles.criteriaItem}>
            <span style={styles.criteriaKey}>To:</span>
            <span style={styles.criteriaValue}>{filter.criteria.to}</span>
          </div>
        )}
        {filter.criteria.subject && (
          <div style={styles.criteriaItem}>
            <span style={styles.criteriaKey}>Subject:</span>
            <span style={styles.criteriaValue}>{filter.criteria.subject}</span>
          </div>
        )}
        {filter.criteria.hasTheWord && (
          <div style={styles.criteriaItem}>
            <span style={styles.criteriaKey}>Has:</span>
            <span style={styles.criteriaValue}>{filter.criteria.hasTheWord}</span>
          </div>
        )}
        {filter.criteria.doesNotHaveTheWord && (
          <div style={styles.criteriaItem}>
            <span style={styles.criteriaKey}>Not:</span>
            <span style={styles.criteriaValue}>{filter.criteria.doesNotHaveTheWord}</span>
          </div>
        )}
      </div>

      <div style={styles.actions}>
        {filter.action.shouldArchive && (
          <span style={styles.badge('#34a853')}>Archive</span>
        )}
        {filter.action.shouldMarkAsRead && (
          <span style={styles.badge('#fbbc04')}>Mark Read</span>
        )}
        {filter.action.shouldNeverSpam && (
          <span style={styles.badge('#4285f4')}>Never Spam</span>
        )}
        {filter.action.shouldNeverMarkAsImportant && (
          <span style={styles.badge('#9e9e9e')}>Not Important</span>
        )}
        {filter.action.forwardTo && (
          <span style={styles.badge('#ea4335')}>Forward</span>
        )}
      </div>

      <button style={styles.button} onClick={handlePreview} disabled={loading}>
        {loading ? 'Loading...' : 'Preview Matches'}
      </button>

      {previews !== null && (
        <div style={styles.previewList}>
          {previews.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#5f6368' }}>No matches found</div>
          ) : (
            previews.map((email) => (
              <div key={email.id} style={styles.previewItem}>
                <div style={styles.previewSubject}>{email.subject}</div>
                <div style={styles.previewMeta}>
                  {email.from} - {email.date}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
