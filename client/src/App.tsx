import { useState } from 'react'
import { DeleteRuleManager } from './components/DeleteRuleManager'
import { FilterList } from './components/FilterList'
import { FilterSync } from './components/FilterSync'
import { QueryTester } from './components/QueryTester'

type Tab = 'filters' | 'query' | 'delete' | 'sync'

function renderTabContent(tab: Tab): React.ReactNode {
  switch (tab) {
    case 'filters':
      return <FilterList />
    case 'query':
      return <QueryTester />
    case 'delete':
      return <DeleteRuleManager />
    case 'sync':
      return <FilterSync />
  }
}

const styles = {
  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
  tab: (active: boolean) =>
    ({
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px 4px 0 0',
      cursor: 'pointer',
      backgroundColor: active ? '#1a73e8' : '#f1f3f4',
      color: active ? '#fff' : '#5f6368',
      fontWeight: active ? 'bold' : 'normal',
    }) as React.CSSProperties,
  content: {
    padding: '20px 0',
  },
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('filters')

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Gmail Filter Manager</h1>
        <nav style={styles.tabs}>
          <button
            type="button"
            style={styles.tab(activeTab === 'filters')}
            onClick={() => setActiveTab('filters')}
          >
            Filters
          </button>
          <button
            type="button"
            style={styles.tab(activeTab === 'query')}
            onClick={() => setActiveTab('query')}
          >
            Query Tester
          </button>
          <button
            type="button"
            style={styles.tab(activeTab === 'delete')}
            onClick={() => setActiveTab('delete')}
          >
            Delete Rules
          </button>
          <button
            type="button"
            style={styles.tab(activeTab === 'sync')}
            onClick={() => setActiveTab('sync')}
          >
            Sync to Gmail
          </button>
        </nav>
      </header>
      <main style={styles.content}>{renderTabContent(activeTab)}</main>
    </div>
  )
}

export default App
