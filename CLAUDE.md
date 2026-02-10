# Gmail Filter Manager - プロジェクト概要

## 概要
GmailフィルタをWebUIで管理するシステム。GAS + clasp + React構成。
フィルタの読み書きはGmail APIで直接行い、スプレッドシートはDeleteRules/Historyのみに使用。

## 技術スタック
- **フロントエンド**: React 19 + TypeScript + Vite
- **バックエンド**: Google Apps Script (clasp でデプロイ)
- **フィルタ保存**: Gmail API（直接読み書き）
- **補助データ保存**: Google Spreadsheet（DeleteRules, Historyのみ）
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
│   ├── webapp.js            # Webエントリーポイント (doGet のみ)
│   ├── controllers/         # API層 (google.script.run から呼ばれる公開関数)
│   │   ├── filterController.js       # フィルタ管理API (5関数: getFilters, createFilter, updateFilter, deleteFilter, applyToExistingMessages)
│   │   ├── emailController.js        # メール検索API (2関数)
│   │   ├── deleteRuleController.js   # 削除ルール管理API (5関数)
│   │   ├── triggerController.js      # トリガー管理API (3関数)
│   │   ├── labelController.js        # ラベル管理API (1関数)
│   │   └── systemController.js       # システム設定API (3関数)
│   ├── services/            # ビジネスロジック層（API呼び出し・副作用あり）
│   │   ├── filterService.js          # Gmail API直接CRUD (getFiltersFromGmail, createFilterInGmail, updateFilterInGmail, deleteFilterFromGmail, applyFilterToExistingMessages)
│   │   ├── emailService.js           # メール検索 (2関数)
│   │   ├── deleteRuleService.js      # 削除ルール管理 (4関数)
│   │   ├── triggerService.js         # トリガー管理 (3関数)
│   │   ├── labelService.js           # ラベル取得/作成 (2関数)
│   │   └── spreadsheetService.js     # スプレッドシート操作 (DeleteRules/Historyのみ)
│   ├── utils/               # ユーティリティ層（純粋関数のみ・副作用なし）
│   │   ├── mappers/         # データマッピング（オブジェクト ⇔ 配列変換）
│   │   │   ├── deleteRuleMapper.js  # 削除ルール変換 (4関数)
│   │   │   └── historyMapper.js     # 履歴変換 (2関数)
│   │   ├── filterUtils.js   # フィルタユーティリティ (1関数: buildSearchQuery)
│   │   └── stringUtils.js   # 文字列操作 (2関数: formatDate, truncate)
│   ├── scripts/             # GASエディタから手動実行するスクリプト
│   │   └── migration.js     # データ移行（migrateDeleteRules）
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
| DeleteRules | 削除ルール（labelId, labelName, delayDays, enabled） |
| History | 変更履歴（timestamp, action, target, details） |

※ フィルタはGmail APIで直接管理。スプレッドシートには保存しない。

## 実装済み機能
- ✅ フィルタ一覧表示（Gmail APIから直接取得、ラベル別グルーピング、検索・フィルタリング）
- ✅ フィルタのクエリプレビュー（マッチするメール表示）
- ✅ フィルタ外メール検索
- ✅ 削除ルール管理（追加/削除/有効無効/即時実行）
- ✅ フィルタ編集UI（WebUIからフィルタを追加・編集・削除 → Gmail APIに直接反映）
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
- `spreadsheets` - データ保存（DeleteRules/History）

## Gitワークフロー
- **mainブランチへの直接push禁止**: 必ずfeatureブランチを作成してPRを経由すること
- ブランチ命名: `feature/機能名` または `fix/修正内容`
- コミット後は `git push -u origin HEAD` でfeatureブランチをpush
- PRを作成してからmainにマージ

## マルチユーザーデプロイ手順
他のGoogleユーザーに公開する場合の手順。

### 1. GCPプロジェクト紐付け
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. GCPプロジェクトの**プロジェクト番号**をコピー
3. GASエディタ →「プロジェクトの設定」→「Google Cloud Platform（GCP）プロジェクト」→ プロジェクト番号を設定

### 2. OAuth同意画面の設定
1. GCPコンソール →「APIとサービス」→「OAuth同意画面」
2. User Type: **外部**
3. アプリ名・サポートメール・デベロッパー連絡先を設定
4. 「テストユーザー」に使用者のGmailアドレスを追加（テストモードなら審査不要、100人まで）

### 3. 正式デプロイの作成
GASエディタ →「デプロイ」→「新しいデプロイ」:
- 種類: **ウェブアプリ**
- 実行ユーザー: **ウェブアプリにアクセスしているユーザー**（※必須: 各ユーザーが自身のGmail/スプレッドシートを操作するため）
- アクセス権: **Googleアカウントを持つ全員**

### 4. ユーザーの初回アクセス
- 「このアプリは確認されていません」警告 →「詳細」→「（安全でない）に移動」で承認
- OAuth同意画面で権限を許可 → スプレッドシートが自動作成される

## 旧仕様からの移行

### 対象
以前のバージョン（フィルタをスプレッドシートで管理、DeleteRulesが3列形式）を使用中のユーザー。

### 手順
1. `clasp push --force` で新コードをデプロイ
2. GASエディタで `migrateDeleteRules()` を実行（DeleteRulesシートを3列→4列に変換）
3. Webアプリにアクセスして動作確認

### 補足
- **Filtersシート**: もう使用しないため放置で問題なし（削除しても可）
- **新規ユーザー**: 移行不要。初回アクセス時にスプレッドシートが新形式で自動作成される
- `migrateDeleteRules()` は冪等。既に移行済みの場合はスキップされる

## 注意事項
- `mailFilters.xml` と `old-prj-delmail/` は `.gitignore` で除外
- 初回セットアップ: GASエディタで `setup()` 実行 → スプレッドシート自動作成
