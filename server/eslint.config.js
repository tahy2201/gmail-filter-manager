import googleappsscript from 'eslint-plugin-googleappsscript'

export default [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'index.html', 'eslint.config.js', 'prettier.config.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        ...googleappsscript.environments.googleappsscript.globals,
        console: 'readonly',
        // Cross-file function references (GAS concatenates all files)
        getSheet: 'readonly',
        addHistory: 'readonly',
        getFiltersFromSpreadsheet: 'readonly',
        saveFiltersToSpreadsheet: 'readonly',
        importFiltersFromXml: 'readonly',
        applyFilters: 'readonly',
        searchGmailEmails: 'readonly',
        listGmailLabels: 'readonly',
        getDeleteRulesFromStorage: 'readonly',
        saveDeleteRulesToStorage: 'readonly',
        executeDeleteByLabel: 'readonly',
        executeAllDeleteRules: 'readonly',
        findUnfilteredEmails: 'readonly',
        getSpreadsheetUrl: 'readonly',
        getOrCreateSpreadsheet: 'readonly',
        buildGmailFilter: 'readonly',
        previewFiltersDiff: 'readonly',
        applyFiltersDiff: 'readonly',
        applyFilterToExistingMessages: 'readonly',
        getDeleteTriggerStatus: 'readonly',
        setupDailyDeleteTrigger: 'readonly',
        removeDailyDeleteTrigger: 'readonly',
        getHistory: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },
  {
    files: ['eslint.config.js', 'prettier.config.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  }
]
