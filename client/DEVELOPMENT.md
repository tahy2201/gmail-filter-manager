# Gmail Filter Manager - 開発ガイド

## 🚀 ローカル開発環境のセットアップ

### 1. Vite Dev Server の起動

```bash
cd client
npm run dev
```

- ブラウザで `http://localhost:5173` にアクセス
- **モックAPI**が自動的に使用されます（GAS APIは呼ばれません）
- ホットリロード対応（ファイル保存時に自動更新）

### 2. モックAPIについて

開発環境（`npm run dev`）では、実際のGAS APIの代わりに**モックAPI**が使用されます。

#### モックAPIの特徴

- ✅ LocalStorageにデータを保存（ブラウザをリロードしてもデータが保持される）
- ✅ 実際のAPI呼び出しを300ms遅延でシミュレート
- ✅ コンソールにAPI呼び出しをログ出力（`[Mock API] ...`）
- ✅ フィルタの追加・編集・削除が動作
- ✅ 削除ルールの管理が動作

#### モックデータの初期化

LocalStorageをクリアして初期データに戻すには：

```javascript
// ブラウザのコンソールで実行
localStorage.clear()
location.reload()
```

#### モックデータのカスタマイズ

`client/src/services/mockData.ts` を編集してモックデータをカスタマイズできます。

---

## 📱 スマホUIの確認方法（Chrome DevTools）

### 方法1: Device Toolbar（推奨）

1. **Chrome DevTools を開く**
   - Mac: `Cmd + Option + I`
   - Windows/Linux: `F12` または `Ctrl + Shift + I`

2. **Device Toolbar を開く**
   - Mac: `Cmd + Shift + M`
   - Windows/Linux: `Ctrl + Shift + M`
   - または DevTools 左上のデバイスアイコンをクリック

3. **デバイスを選択**
   - プリセット: `Pixel 9 Pro`、`iPhone 14 Pro` など
   - カスタム: `Edit...` をクリックして独自のデバイスを追加

4. **Pixel 9 Pro の設定**
   - **幅**: `960px`
   - **高さ**: `2142px`
   - **Device Pixel Ratio**: `3`
   - **User Agent**: `Mobile Chrome`

5. **タッチ操作をシミュレート**
   - Device Toolbar で `Touch` オプションが自動的に有効化される
   - クリック操作がタッチ操作としてエミュレートされる

### 方法2: Responsive Design Mode（詳細設定）

1. DevTools の右上の「⋮」メニュー → `More tools` → `Sensors`
2. **Sensors タブ**で以下を設定：
   - **Touch**: `Force touch`
   - **Emulate Idle Detector state**: `User active, screen unlocked`

3. **Rendering タブ**で追加設定（オプション）：
   - `Emulate CSS media feature pointer: coarse`
   - `Emulate CSS media feature hover: none`

### タッチ操作の確認

DevTools Console で以下を実行して、Feature Detection が正しく動作するか確認：

```javascript
console.log('maxTouchPoints:', navigator.maxTouchPoints)
console.log('pointer: coarse?', window.matchMedia('(pointer: coarse)').matches)
console.log('hover: none?', window.matchMedia('(hover: none)').matches)
```

**期待される結果（スマホ）**:
- `maxTouchPoints`: `1` 以上
- `pointer: coarse`: `true`
- `hover: none`: `true`

**期待される結果（PC）**:
- `maxTouchPoints`: `0`
- `pointer: coarse`: `false`
- `hover: none`: `false`

---

## 🛠️ デバッグのヒント

### モックAPIのログ確認

コンソールに以下のようなログが出力されます：

```
🔧 [DEV MODE] Using Mock API
[Mock API] getFilters
[Mock API] getLabels
[Mock API] getDeleteRules
```

### 実際のGAS APIとモックAPIの切り替え

`client/src/services/index.ts` で切り替えロジックを確認できます：

```typescript
const isDevelopment = import.meta.env.DEV
export const api = isDevelopment ? mockGasApi : gasApi
```

強制的にGAS APIを使用したい場合（開発環境でも）：

```typescript
// index.ts を一時的に変更
export const api = gasApi
```

---

## 🧪 ビルド＆デプロイ

### 本番ビルド

```bash
cd client
npm run build
```

- `dist/index.html` に単一HTMLファイルとして出力
- 自動的に `server/index.html` にコピーされる
- **本番環境では実際のGAS APIが使用されます**

### GASにデプロイ

```bash
cd ..
clasp push --force
```

---

## 📊 ファイル構成

```
client/
├── src/
│   ├── services/
│   │   ├── index.ts          # API切り替え（DEV/PROD）
│   │   ├── gas.ts            # 実際のGAS API
│   │   ├── mockGas.ts        # モックAPI（開発環境用）
│   │   └── mockData.ts       # モックデータ
│   ├── components/           # UIコンポーネント
│   ├── hooks/                # カスタムフック
│   └── types/                # TypeScript型定義
└── DEVELOPMENT.md            # このファイル
```

---

## 🎯 よくある質問

### Q. モックAPIでデータが保存されない

A. LocalStorageが有効になっているか確認してください。ブラウザのプライベートモードでは制限される場合があります。

### Q. スマホUIが表示されない（テーブルが表示される）

A. Chrome DevTools の Device Toolbar で `Touch` が有効になっているか確認してください。Feature Detection が `coarse pointer` を検出する必要があります。

### Q. 本番環境でモックAPIが使われてしまう

A. ビルド後は自動的に実際のGAS APIが使われます。`npm run build` でビルドしてから `clasp push` してください。

### Q. Pixel 9 Pro のプリセットがない

A. Device Toolbar の `Edit...` から以下の設定でカスタムデバイスを追加：
   - Name: `Pixel 9 Pro`
   - Width: `960`
   - Height: `2142`
   - Device Pixel Ratio: `3`
   - User Agent String: `Mobile Chrome`

---

## 💡 Tips

### 1. フォントサイズの微調整

スマホUIのフォントサイズは以下のファイルで調整できます：

- `FilterCard.tsx`: カード内のフォントサイズ
- `FilterCardList.tsx`: セクションヘッダーのフォントサイズ
- `ActionIcons.tsx`: アイコンサイズ

### 2. 高速開発

Vite dev server はホットリロード対応なので、ファイルを保存するだけでブラウザが自動更新されます。

### 3. 複数デバイスで同時確認

Vite dev server は `http://localhost:5173` だけでなく、ネットワークアドレス（例: `http://192.168.1.100:5173`）でもアクセスできます。実機（スマホ）から同じネットワーク上でアクセスして確認できます。

```bash
npm run dev -- --host
```
