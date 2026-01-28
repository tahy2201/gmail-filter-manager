import { useState } from 'react';
import { gasApi } from '../services/gas';
import type { EmailPreview } from '../types';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  button: {
    padding: '12px 24px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#1a73e8',
    color: '#fff',
    fontWeight: 'bold' as const,
  },
  buttonDisabled: {
    backgroundColor: '#dadce0',
    cursor: 'not-allowed',
  },
  results: {
    border: '1px solid #dadce0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  resultHeader: {
    padding: '12px 16px',
    backgroundColor: '#f1f3f4',
    fontWeight: 'bold' as const,
    fontSize: '14px',
    color: '#3c4043',
  },
  emailItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  emailSubject: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#202124',
    marginBottom: '4px',
  },
  emailMeta: {
    fontSize: '12px',
    color: '#5f6368',
    marginBottom: '4px',
  },
  emailSnippet: {
    fontSize: '12px',
    color: '#5f6368',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  empty: {
    padding: '24px',
    textAlign: 'center' as const,
    color: '#5f6368',
  },
  error: {
    padding: '16px',
    backgroundColor: '#fce8e6',
    color: '#c5221f',
    borderRadius: '4px',
  },
  unfilteredSection: {
    marginTop: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#1a73e8',
    marginBottom: '12px',
  },
};

export function QueryTester() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EmailPreview[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unfilteredEmails, setUnfilteredEmails] = useState<EmailPreview[] | null>(null);
  const [loadingUnfiltered, setLoadingUnfiltered] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const emails = await gasApi.searchEmails(query, 50);
      setResults(emails);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGetUnfiltered = async () => {
    setLoadingUnfiltered(true);
    setError(null);
    try {
      const emails = await gasApi.getUnfilteredEmails(50);
      setUnfilteredEmails(emails);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get unfiltered emails');
    } finally {
      setLoadingUnfiltered(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter Gmail search query (e.g., from:example.com subject:invoice)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={styles.input}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            ...styles.button,
            ...(loading || !query.trim() ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {results !== null && (
        <div style={styles.results}>
          <div style={styles.resultHeader}>
            {results.length} results found
          </div>
          {results.length === 0 ? (
            <div style={styles.empty}>No emails match this query</div>
          ) : (
            results.map((email) => (
              <div key={email.id} style={styles.emailItem}>
                <div style={styles.emailSubject}>{email.subject || '(No Subject)'}</div>
                <div style={styles.emailMeta}>
                  {email.from} - {email.date}
                </div>
                <div style={styles.emailSnippet}>{email.snippet}</div>
              </div>
            ))
          )}
        </div>
      )}

      <div style={styles.unfilteredSection}>
        <div style={styles.sectionTitle}>Unfiltered Emails</div>
        <button
          onClick={handleGetUnfiltered}
          disabled={loadingUnfiltered}
          style={{
            ...styles.button,
            backgroundColor: '#34a853',
            ...(loadingUnfiltered ? styles.buttonDisabled : {}),
          }}
        >
          {loadingUnfiltered ? 'Loading...' : 'Find Emails Without Filters'}
        </button>

        {unfilteredEmails !== null && (
          <div style={{ ...styles.results, marginTop: '12px' }}>
            <div style={styles.resultHeader}>
              {unfilteredEmails.length} unfiltered emails
            </div>
            {unfilteredEmails.length === 0 ? (
              <div style={styles.empty}>All recent emails match at least one filter</div>
            ) : (
              unfilteredEmails.map((email) => (
                <div key={email.id} style={styles.emailItem}>
                  <div style={styles.emailSubject}>{email.subject || '(No Subject)'}</div>
                  <div style={styles.emailMeta}>
                    {email.from} - {email.date}
                  </div>
                  <div style={styles.emailSnippet}>{email.snippet}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
