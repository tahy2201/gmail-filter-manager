function doGet(e) {
  try {
    const template = HtmlService.createTemplateFromFile('index')
    const html = template
      .evaluate()
      .setTitle('Gmail Filter Manager')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    return html
  } catch (error) {
    console.error('Error in doGet:', error)
    return HtmlService.createHtmlOutput(`
      <h1>Error</h1>
      <p>${error.message}</p>
    `)
  }
}

function getFilters() {
  try {
    return getFiltersFromSpreadsheet()
  } catch (error) {
    console.error('Error getting filters:', error)
    throw new Error(`Failed to get filters: ${error.message}`)
  }
}

function saveFilters(filters) {
  try {
    return saveFiltersToSpreadsheet(filters)
  } catch (error) {
    console.error('Error saving filters:', error)
    throw new Error(`Failed to save filters: ${error.message}`)
  }
}

function importFiltersXml(xml) {
  try {
    return importFiltersFromXml(xml)
  } catch (error) {
    console.error('Error importing filters:', error)
    throw new Error(`Failed to import filters: ${error.message}`)
  }
}

function applyFiltersToGmail() {
  try {
    return applyFilters()
  } catch (error) {
    console.error('Error applying filters:', error)
    throw new Error(`Failed to apply filters: ${error.message}`)
  }
}

function searchEmails(query, max) {
  try {
    return searchGmailEmails(query, max || 50)
  } catch (error) {
    console.error('Error searching emails:', error)
    throw new Error(`Failed to search emails: ${error.message}`)
  }
}

function getLabels() {
  try {
    return listGmailLabels()
  } catch (error) {
    console.error('Error getting labels:', error)
    throw new Error(`Failed to get labels: ${error.message}`)
  }
}

function getDeleteRules() {
  try {
    return getDeleteRulesFromStorage()
  } catch (error) {
    console.error('Error getting delete rules:', error)
    throw new Error(`Failed to get delete rules: ${error.message}`)
  }
}

function saveDeleteRules(rules) {
  try {
    return saveDeleteRulesToStorage(rules)
  } catch (error) {
    console.error('Error saving delete rules:', error)
    throw new Error(`Failed to save delete rules: ${error.message}`)
  }
}

function executeDeleteRule(labelName, days) {
  try {
    return executeDeleteByLabel(labelName, days)
  } catch (error) {
    console.error('Error executing delete rule:', error)
    throw new Error(`Failed to execute delete rule: ${error.message}`)
  }
}

function getCurrentUser() {
  try {
    return {
      email: Session.getActiveUser().getEmail()
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    throw new Error(`Failed to get current user: ${error.message}`)
  }
}

function getUnfilteredEmails(max) {
  try {
    return findUnfilteredEmails(max || 50)
  } catch (error) {
    console.error('Error getting unfiltered emails:', error)
    throw new Error(`Failed to get unfiltered emails: ${error.message}`)
  }
}

function getDataSpreadsheetUrl() {
  try {
    return {
      url: getSpreadsheetUrl()
    }
  } catch (error) {
    console.error('Error getting spreadsheet URL:', error)
    throw new Error(`Failed to get spreadsheet URL: ${error.message}`)
  }
}

function runScheduledDeleteRules() {
  try {
    const results = executeAllDeleteRules()

    let totalDeleted = 0
    for (const result of results) {
      totalDeleted += result.deleted
      console.log(`Deleted ${result.deleted} emails from ${result.label}`)
    }

    console.log(`Total deleted: ${totalDeleted} emails`)
    return results
  } catch (error) {
    console.error('Error running scheduled delete rules:', error)
    throw new Error(`Failed to run scheduled delete rules: ${error.message}`)
  }
}

function setup() {
  const ss = getOrCreateSpreadsheet()
  console.log('Spreadsheet created/initialized: ' + ss.getUrl())
  return {
    spreadsheetUrl: ss.getUrl(),
    spreadsheetId: ss.getId()
  }
}

function previewFilterDiff() {
  try {
    return previewFiltersDiff()
  } catch (error) {
    console.error('Error previewing filter diff:', error)
    throw new Error(`Failed to preview filter diff: ${error.message}`)
  }
}

function applyFilterDiff(dryRun) {
  try {
    return applyFiltersDiff(dryRun === true)
  } catch (error) {
    console.error('Error applying filter diff:', error)
    throw new Error(`Failed to apply filter diff: ${error.message}`)
  }
}

function applyToExistingMessages(filter) {
  try {
    return applyFilterToExistingMessages(filter)
  } catch (error) {
    console.error('Error applying filter to existing messages:', error)
    throw new Error(`Failed to apply filter to existing messages: ${error.message}`)
  }
}

function getTriggerStatus() {
  try {
    return getDeleteTriggerStatus()
  } catch (error) {
    console.error('Error getting trigger status:', error)
    throw new Error(`Failed to get trigger status: ${error.message}`)
  }
}

function setupDeleteTrigger(hour) {
  try {
    return setupDailyDeleteTrigger(hour)
  } catch (error) {
    console.error('Error setting up delete trigger:', error)
    throw new Error(`Failed to setup delete trigger: ${error.message}`)
  }
}

function removeDeleteTrigger() {
  try {
    return removeDailyDeleteTrigger()
  } catch (error) {
    console.error('Error removing delete trigger:', error)
    throw new Error(`Failed to remove delete trigger: ${error.message}`)
  }
}

function getDeleteHistory(limit) {
  try {
    return getHistory(limit || 50)
  } catch (error) {
    console.error('Error getting delete history:', error)
    throw new Error(`Failed to get delete history: ${error.message}`)
  }
}
