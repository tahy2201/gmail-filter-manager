/**
 * Webアプリケーションのエントリーポイント
 * HTMLの配信を担当
 *
 * 各API関数はcontrollers/配下に分離されています：
 * - filterController.js: フィルタ管理
 * - emailController.js: メール検索
 * - deleteRuleController.js: 削除ルール管理
 * - labelController.js: ラベル管理
 * - systemController.js: システム設定
 */

/**
 * WebアプリケーションのGETリクエストハンドラ
 * React アプリ（index.html）を配信
 * @param {Object} e イベントパラメータ
 * @returns {HtmlOutput} HTMLレスポンス
 */
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
