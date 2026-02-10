/**
 * フィルタ管理Controller
 * Gmail API 経由でのフィルタ CRUD を担当
 */

/**
 * Gmail からフィルタ一覧を取得
 * @returns {Array} フィルタ一覧
 */
function getFilters() {
  try {
    return getFiltersFromGmail()
  } catch (error) {
    console.error('Error getting filters:', error)
    throw new Error(`Failed to get filters: ${error.message}`)
  }
}

/**
 * Gmail にフィルタを作成
 * @param {Object} filterEntry フィルタ設定
 * @returns {Object} 作成されたフィルタ（Gmail ID付き）
 */
function createFilter(filterEntry) {
  try {
    return createFilterInGmail(filterEntry)
  } catch (error) {
    console.error('Error creating filter:', error)
    throw new Error(`Failed to create filter: ${error.message}`)
  }
}

/**
 * Gmail のフィルタを更新
 * @param {string} filterId Gmail フィルタ ID
 * @param {Object} filterEntry 更新後のフィルタ設定
 * @returns {Object} 更新されたフィルタ（新Gmail ID付き）
 */
function updateFilter(filterId, filterEntry) {
  try {
    return updateFilterInGmail(filterId, filterEntry)
  } catch (error) {
    console.error('Error updating filter:', error)
    throw new Error(`Failed to update filter: ${error.message}`)
  }
}

/**
 * Gmail からフィルタを削除
 * @param {string} filterId Gmail フィルタ ID
 * @returns {Object} 削除結果
 */
function deleteFilter(filterId) {
  try {
    return deleteFilterFromGmail(filterId)
  } catch (error) {
    console.error('Error deleting filter:', error)
    throw new Error(`Failed to delete filter: ${error.message}`)
  }
}

/**
 * 既存メールにフィルタを適用
 * @param {Object} filter フィルタ設定
 * @returns {Object} 適用結果
 */
function applyToExistingMessages(filter) {
  try {
    return applyFilterToExistingMessages(filter)
  } catch (error) {
    console.error('Error applying filter to existing messages:', error)
    throw new Error(`Failed to apply filter to existing messages: ${error.message}`)
  }
}
