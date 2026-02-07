/**
 * 環境に応じてAPIを切り替え
 * 開発環境: mockGasApi（モックAPI）
 * 本番環境: gasApi（実際のGAS API）
 */

import { gasApi } from './gas'
import { mockGasApi } from '@mock/mockGas'

// 開発環境かどうかを判定
const isDevelopment = import.meta.env.DEV

// APIを切り替え
export const api = isDevelopment ? mockGasApi : gasApi

// デバッグ用にログ出力
if (isDevelopment) {
  console.log('🔧 [DEV MODE] Using Mock API')
} else {
  console.log('🚀 [PROD MODE] Using GAS API')
}
