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
        // spreadsheetService
        getSheet: 'readonly',
        addHistory: 'readonly',
        getHistory: 'readonly',
        getSpreadsheetUrl: 'readonly',
        getOrCreateSpreadsheet: 'readonly',
        updateSpreadsheetId: 'readonly',
        // filterService
        buildGmailFilter: 'readonly',
        buildLabelMap: 'readonly',
        getFiltersFromGmail: 'readonly',
        createFilterInGmail: 'readonly',
        updateFilterInGmail: 'readonly',
        deleteFilterFromGmail: 'readonly',
        applyFilterToExistingMessages: 'readonly',
        // deleteRuleService
        getDeleteRulesFromStorage: 'readonly',
        saveDeleteRulesToStorage: 'readonly',
        executeDeleteByLabel: 'readonly',
        executeAllDeleteRules: 'readonly',
        // emailService
        searchGmailEmails: 'readonly',
        findUnfilteredEmails: 'readonly',
        // labelService
        listGmailLabels: 'readonly',
        getOrCreateLabel: 'readonly',
        // triggerService
        getDeleteTriggerStatus: 'readonly',
        setupDailyDeleteTrigger: 'readonly',
        removeDailyDeleteTrigger: 'readonly',
        // mappers
        rowsToDeleteRules: 'readonly',
        deleteRulesToRows: 'readonly',
        rowsToHistory: 'readonly',
        // utils
        buildSearchQuery: 'readonly',
        formatDate: 'readonly',
        truncate: 'readonly'
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
