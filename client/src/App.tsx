import { useState } from 'react';
import { FilterList } from './components/FilterList';
import { QueryTester } from './components/QueryTester';
import { DeleteRuleManager } from './components/DeleteRuleManager';

type Tab = 'filters' | 'query' | 'delete';

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    marginBottom: '16px',
    color: '#1a73e8',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '8px',
  },
  tab: (active: boolean) => ({
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    backgroundColor: active ? '#1a73e8' : '#f1f3f4',
    color: active ? '#fff' : '#5f6368',
    fontWeight: active ? 'bold' : 'normal',
  } as React.CSSProperties),
  content: {
    padding: '20px 0',
  },
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('filters');

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Gmail Filter Manager</h1>
        <nav style={styles.tabs}>
          <button
            style={styles.tab(activeTab === 'filters')}
            onClick={() => setActiveTab('filters')}
          >
            Filters
          </button>
          <button
            style={styles.tab(activeTab === 'query')}
            onClick={() => setActiveTab('query')}
          >
            Query Tester
          </button>
          <button
            style={styles.tab(activeTab === 'delete')}
            onClick={() => setActiveTab('delete')}
          >
            Delete Rules
          </button>
        </nav>
      </header>
      <main style={styles.content}>
        {activeTab === 'filters' && <FilterList />}
        {activeTab === 'query' && <QueryTester />}
        {activeTab === 'delete' && <DeleteRuleManager />}
      </main>
    </div>
  );
}

export default App;
