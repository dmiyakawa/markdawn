# Markdown Editor

プロフェッショナルなWebベースのMarkdownエディターです。リアルタイムプレビュー、画像アップロード機能、完全なファイル操作機能を備えています。

## 📋 プロジェクト概要

このプロジェクトは、モダンなWebテクノロジーを使用して構築されたMarkdownエディターです。主な特徴：

### ✨ 主要機能
- **CodeMirror 6統合**: シンタックスハイライト付きのプロフェッショナルなエディター
- **Emacs風キーバインド**: 完全なナビゲーションショートカット（Ctrl-a, Ctrl-e, Ctrl-k等）
- **検索・置換機能**: 正規表現と大文字小文字区別対応の高度な検索システム
- **サイドバイサイドレイアウト**: エディターとプレビューの分割表示（リサイズ可能）
- **画像管理システム**: ドラッグ&ドロップアップロード、ブラウザー内保存、ZIP出力統合
- **ファイル操作**: インポート、エクスポート（MD/ZIP）、保存/読み込み
- **レスポンシブデザイン**: モバイル・タブレット最適化
- **フルスクリーンモード**: 集中執筆のための画面最大活用
- **自動保存**: 30秒間隔のバックグラウンド保存
- **リアルタイムプレビュー**: GitHubフレーバーMarkdown対応

### 🛠 技術スタック
- **Vue.js 3.5.18** - Composition API使用
- **TypeScript 5.9.2** - 型安全な開発
- **CodeMirror 6** - プロフェッショナルなコードエディター
- **Tailwind CSS 4.1.11** - ユーティリティファーストCSS
- **Vite 7.1.1** - 高速ビルドツール
- **Vitest 3.2.4** - 単体テストフレームワーク  
- **Playwright** - E2Eテスト・ビジュアルリグレッションテスト

## 🚀 ローカル起動方法

### 前提条件
- Node.js 18以上
- npm または yarn

### インストールと起動
```bash
# リポジトリをクローン
git clone <repository-url>
cd rss3

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

開発サーバーが起動後、ブラウザーで `http://localhost:5173` にアクセスしてください。

### プロダクションビルド
```bash
# プロダクション用にビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 🧪 テストの実行方法

### 単体テスト（Unit Test）
```bash
# 全ての単体テストを実行
npm run test

# カバレッジ付きでテスト実行
npm run test:coverage

# 監視モードでテスト実行
npm run test:watch
```

**テストカバレッジ**: 現在80%以上のカバレッジを維持（69個のテストが全て通過）

### E2Eテスト（End-to-End Test）
```bash
# E2Eテストを実行
npm run test:e2e

# ヘッド付きモードで実行（ブラウザーを表示）
npm run test:e2e:headed

# 特定のブラウザーで実行
npm run test:e2e:chromium
npm run test:e2e:firefox

# ビジュアルリグレッションテストのベースラインを更新
npm run test:e2e:update

# テストレポートを表示
npm run test:e2e:report
```

**対応ブラウザー**: Chromium、Firefox、Mobile Chrome

### コード品質チェック
```bash
# ESLintでコード検査
npm run lint

# Prettierでコード整形
npm run format
```

## 📁 フォルダー/ファイル構造

```
rss3/
├── src/                          # ソースコード
│   ├── components/               # Vueコンポーネント
│   │   ├── CodeMirrorEditor.vue  # メインエディター（Emacs風ショートカット）
│   │   ├── FindReplace.vue       # 検索・置換機能
│   │   └── ImageUploader.vue     # 画像アップロード機能
│   ├── composables/              # Vue Composables（再利用可能ロジック）
│   │   ├── useDarkMode.ts        # テーマ管理
│   │   ├── useDragAndDrop.ts     # ドラッグ&ドロップ機能
│   │   └── useResizablePanes.ts  # パネルリサイズ機能
│   ├── utils/                    # ユーティリティ関数
│   │   ├── fileOperations.ts     # ファイル操作（インポート/エクスポート/ZIP）
│   │   ├── imageOperations.ts    # 画像処理・保存・Markdown生成
│   │   └── markdown.ts           # Markdown/HTML変換
│   ├── App.vue                   # メインアプリケーションコンポーネント
│   ├── main.ts                   # アプリケーションエントリーポイント
│   └── style.css                 # グローバルスタイル
├── tests/                        # テストファイル
│   └── e2e/                      # E2Eテスト
│       ├── core-flows.spec.ts    # コア機能テスト
│       ├── image-upload.spec.ts  # 画像アップロードテスト
│       ├── performance.spec.ts   # パフォーマンステスト
│       └── visual-regression.spec.ts # ビジュアルリグレッションテスト
├── ai/                           # AI開発支援ドキュメント
│   ├── architecture.md           # システムアーキテクチャ
│   ├── decisions.md              # 技術的決定事項
│   ├── tasks.md                  # 残タスク・TODO
│   └── logs/                     # 開発セッションログ
├── dist/                         # ビルド出力（自動生成）
├── playwright-report/            # E2Eテストレポート（自動生成）
├── test-results/                 # テスト結果（自動生成）
├── package.json                  # 依存関係・スクリプト定義
├── vite.config.ts               # Vite設定
├── vitest.config.ts             # Vitest設定  
├── playwright.config.ts         # Playwright設定
├── tsconfig.json                # TypeScript設定
├── tailwind.config.js           # Tailwind CSS設定
└── eslint.config.js             # ESLint設定
```

### 🎯 重要なファイル説明

#### コアコンポーネント
- **`src/App.vue`**: メインレイアウト、メニューバー、分割パネル管理
- **`src/components/CodeMirrorEditor.vue`**: CodeMirror 6統合エディター
- **`src/components/FindReplace.vue`**: 検索・置換UI（メニューバー下に配置）

#### ユーティリティ
- **`src/utils/markdown.ts`**: Markdown↔HTML変換（marked.js使用）
- **`src/utils/fileOperations.ts`**: ファイルI/O、localStorage、ZIP作成
- **`src/utils/imageOperations.ts`**: 画像処理、リサイズ、ブラウザー保存

#### テスト
- **単体テスト**: `*.test.ts`ファイルで各機能をテスト
- **E2Eテスト**: `tests/e2e/`でユーザーワークフローをテスト
- **ビジュアルリグレッション**: スクリーンショット比較でUI一貫性を保証

## 🎮 キーボードショートカット

### Emacs風ナビゲーション
- **Ctrl-a**: 行頭に移動
- **Ctrl-e**: 行末に移動  
- **Ctrl-b**: カーソルを左に移動
- **Ctrl-f**: カーソルを右に移動
- **Ctrl-n**: 次の行に移動（列位置を保持）
- **Ctrl-p**: 前の行に移動（列位置を保持）
- **Ctrl-k**: カーソルから行末まで切り取り（キルリング）
- **Ctrl-y**: 切り取ったテキストを貼り付け（ヤンク）

### その他
- **Ctrl-h**: 検索・置換パネルの表示切り替え

## 🔧 開発コマンド一覧

| コマンド | 説明 |
|---------|-----|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果をプレビュー |
| `npm run test` | 単体テスト実行 |
| `npm run test:coverage` | カバレッジ付きテスト |
| `npm run test:e2e` | E2Eテスト実行 |
| `npm run test:e2e:headed` | ブラウザー表示でE2Eテスト |
| `npm run lint` | コード検査 |
| `npm run format` | コード整形 |

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

問題が発生した場合は、GitHubのIssuesページで報告してください。