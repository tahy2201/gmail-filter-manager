# Gmail Filter Manager - プロジェクト概要

## 概要
GmailフィルタをWebUIで管理するシステム。GAS + clasp + React構成。

## 技術スタック
- **フロントエンド**: React 19 + TypeScript + Vite
- **バックエンド**: Google Apps Script (clasp でデプロイ)
- **データ保存**: Google Spreadsheet
- **ビルド**: vite-plugin-singlefile (単一HTMLに出力)

## ディレクトリ構成
```
gmail-filter-manager/
├── .clasp.json              # scriptId設定済み、rootDir: server
├── client/                  # React アプリ
│   ├── src/
│   │   ├── components/      # RuleManager, QueryTester, FilterEditForm, ConfirmDialog, Modal
│   │   ├── hooks/           # useFilters, useLabels, useDeleteRules, useLabelGroups
│   │   ├── services/gas.ts  # google.script.run ラッパー
│   │   └── types/index.ts   # 型定義
│   └── vite.config.ts
├── server/                  # GAS コード
│   ├── webapp.js            # doGet + API エンドポイント
│   ├── services/
│   │   ├── filterService.js     # フィルタ CRUD、XMLパース
│   │   ├── filterSyncService.js # Gmail差分同期
│   │   ├── labelService.js      # Gmail ラベル取得
│   │   ├── emailService.js      # メール検索
│   │   ├── deleteService.js     # 削除ルール管理・実行
│   │   └── spreadsheetService.js # スプレッドシート管理
│   ├── utils/
│   │   └── importHelper.js  # XMLインポート補助（GASエディタから実行）
│   └── appsscript.json      # OAuth スコープ設定
└── package.json
```

## デプロイ情報
- **Script ID**: `1G9JDl2wTuWHqBQB04U5tqzqCiBgz0kablKZIEwdv6J-KZVES40sHB_G-`
- **WebアプリURL (HEAD)**: `https://script.google.com/macros/s/AKfycbwru5VgwLUeuVfTJ9hqiYQsfdKC6jq7zA6HuMHV5go1/exec`
  - ※ `@HEAD`デプロイメント。`clasp push`だけで常に最新コードが反映される
- **GASエディタ**: `https://script.google.com/d/1G9JDl2wTuWHqBQB04U5tqzqCiBgz0kablKZIEwdv6J-KZVES40sHB_G-/edit`

## スプレッドシート構成
| シート名 | 内容 |
|----------|------|
| Filters | フィルタ設定（id, from, to, subject, hasTheWord, doesNotHaveTheWord, label, shouldArchive, shouldMarkAsRead, shouldNeverSpam） |
| DeleteRules | 削除ルール（labelName, delayDays, enabled） |
| History | 変更履歴（timestamp, action, target, details） |

## 実装済み機能
- ✅ フィルタ一覧表示（ラベル別グルーピング、検索・フィルタリング）
- ✅ フィルタのクエリプレビュー（マッチするメール表示）
- ✅ フィルタ外メール検索
- ✅ 削除ルール管理（追加/削除/有効無効/即時実行）
- ✅ XMLインポート（GASエディタから `importMyFilters()` 実行）
- ✅ スプレッドシートへのデータ保存
- ✅ 自動Gmail同期（フィルタ保存時に自動でGmailフィルタに反映）
- ✅ フィルタ編集UI（WebUIからフィルタを追加・編集・削除）
- ✅ 既存メールへのフィルタ適用（条件に一致する既存メールにラベル付与）

## 未実装機能
- ❌ 日次トリガー設定UI（`setupDailyDeleteTrigger()` 関数はあるがUI未連携）

## 開発コマンド
```bash
# ビルド & デプロイ（@HEAD使用のため clasp push のみで反映される）
cd client && npm run build  # React ビルド → server/index.html
clasp push --force          # GAS にプッシュ → 即座に反映

# 開発
cd client && npm run dev    # Vite dev server（GAS APIは動作しない）
```

## OAuth スコープ
- `gmail.modify` - メール削除（ゴミ箱移動）に必要
- `gmail.settings.basic` - フィルタ設定
- `gmail.labels` - ラベル取得
- `spreadsheets` - データ保存

## Gitワークフロー
- **mainブランチへの直接push禁止**: 必ずfeatureブランチを作成してPRを経由すること
- ブランチ命名: `feature/機能名` または `fix/修正内容`
- コミット後は `git push -u origin HEAD` でfeatureブランチをpush
- PRを作成してからmainにマージ

## 注意事項
- `mailFilters.xml` と `old-prj-delmail/` は `.gitignore` で除外
- 初回セットアップ: GASエディタで `setup()` 実行 → スプレッドシート自動作成
- XMLインポート: `importHelper.js` の `importMyFilters()` にXMLを貼り付けて実行
