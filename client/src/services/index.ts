/**
 * 環境に応じてAPIを切り替え
 * 開発環境: mockGasApi（モックAPI）
 * 本番環境: gasApi（実際のGAS API）
 */

import { gasApi } from './gas'
import { mockGasApi } from '@mock/mockGas'

const isDevelopment = import.meta.env.DEV

export const api = isDevelopment ? mockGasApi : gasApi

if (isDevelopment) {
  console.log('🔧 [DEV MODE] Using Mock API')
} else {
  console.log('🚀 [PROD MODE] Using GAS API')
}
