const DELETE_RULES_SHEET = 'DeleteRules'

function getDeleteRulesFromStorage() {
  const sheet = getSheet(DELETE_RULES_SHEET)
  const lastRow = sheet.getLastRow()

  if (lastRow <= 1) return []

  const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues()
  const rules = []

  for (const row of data) {
    if (!row[0]) continue
    rules.push({
      labelName: row[0],
      delayDays: Number(row[1]) || 30,
      enabled: row[2] === true || row[2] === 'TRUE'
    })
  }

  return rules
}

function saveDeleteRulesToStorage(rules) {
  const sheet = getSheet(DELETE_RULES_SHEET)
  const lastRow = sheet.getLastRow()

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 3).clearContent()
  }

  if (rules.length > 0) {
    const data = rules.map((r) => [r.labelName, r.delayDays, r.enabled])
    sheet.getRange(2, 1, data.length, 3).setValues(data)
  }

  addHistory('SAVE_DELETE_RULES', 'DeleteRules', `Saved ${rules.length} rules`)
  return { success: true }
}

function executeDeleteByLabel(labelName, days) {
  const query = `older_than:${days}d -is:important label:${labelName}`
  const threads = GmailApp.search(query)

  let deleted = 0
  for (const thread of threads) {
    try {
      thread.moveToTrash()
      deleted++
    } catch (e) {
      console.error(`Error deleting thread ${thread.getId()}:`, e)
    }
  }

  console.log(`Deleted ${deleted} threads from label "${labelName}" (${days} days old)`)
  addHistory('DELETE_EMAILS', labelName, `Deleted ${deleted} threads (older than ${days} days)`)
  return { deleted }
}

function executeAllDeleteRules() {
  const rules = getDeleteRulesFromStorage()
  const results = []

  for (const rule of rules) {
    if (!rule.enabled) continue
    const result = executeDeleteByLabel(rule.labelName, rule.delayDays)
    results.push({
      label: rule.labelName,
      days: rule.delayDays,
      deleted: result.deleted
    })
  }

  return results
}

function setupDailyDeleteTrigger(hour) {
  const triggers = ScriptApp.getProjectTriggers()
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'runScheduledDeleteRules') {
      ScriptApp.deleteTrigger(trigger)
    }
  }

  const triggerHour = hour ?? 3

  ScriptApp.newTrigger('runScheduledDeleteRules')
    .timeBased()
    .atHour(triggerHour)
    .everyDays(1)
    .inTimezone('Asia/Tokyo')
    .create()

  PropertiesService.getScriptProperties().setProperty('DELETE_TRIGGER_HOUR', String(triggerHour))

  console.log(`Daily delete trigger set for ${triggerHour}:00 JST`)
  addHistory('SETUP_TRIGGER', 'DeleteTrigger', `Scheduled daily at ${triggerHour}:00 JST`)
  return { success: true, hour: triggerHour }
}

function removeDailyDeleteTrigger() {
  const triggers = ScriptApp.getProjectTriggers()
  let removed = false

  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'runScheduledDeleteRules') {
      ScriptApp.deleteTrigger(trigger)
      removed = true
    }
  }

  PropertiesService.getScriptProperties().deleteProperty('DELETE_TRIGGER_HOUR')

  console.log('Daily delete trigger removed')
  if (removed) {
    addHistory('REMOVE_TRIGGER', 'DeleteTrigger', 'Daily trigger removed')
  }
  return { success: true }
}

function getDeleteTriggerStatus() {
  const triggers = ScriptApp.getProjectTriggers()

  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'runScheduledDeleteRules') {
      const savedHour = PropertiesService.getScriptProperties().getProperty('DELETE_TRIGGER_HOUR')
      const hour = savedHour ? Number(savedHour) : 3
      return {
        enabled: true,
        hour: isNaN(hour) ? 3 : hour
      }
    }
  }
  return { enabled: false, hour: null }
}
