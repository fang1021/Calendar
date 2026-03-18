# Calendar
共有用のカレンダー

自分の予定を他人に共有するためのWebカレンダーアプリです。

## ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [仕様書](./docs/spec.md) | アプリの機能・UI・データモデルの詳細仕様 |
| [技術スタック解説](./docs/tech-stack.md) | 使用技術の初心者向け解説 |

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **バックエンド/DB**: Supabase（PostgreSQL + Auth + RLS）
- **ホスティング**: Vercel

## セットアップ

### 1. Supabase プロジェクトの作成

1. [supabase.com](https://supabase.com) でアカウント作成・プロジェクト作成
2. Supabase ダッシュボードの **SQL Editor** で [`supabase/migrations/001_initial.sql`](./supabase/migrations/001_initial.sql) を実行
3. **Authentication > Users** からユーザーを作成（メール + パスワード）

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Supabaseの接続情報を設定：

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

※ 接続情報は Supabase ダッシュボードの **Project Settings > API** で確認できます。

### 3. 開発サーバーの起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアクセスできます。

## ページ構成

| ページ | URL | 説明 |
|--------|-----|------|
| リダイレクト | `/` | ログイン状態に応じて自動遷移 |
| ログイン | `/login` | 管理者ログイン |
| 管理カレンダー | `/admin` | 予定の追加・編集・削除 |
| 共有設定 | `/settings` | 共有URL・iframe・LINEシェア |
| 公開カレンダー | `/calendar/:userId` | 閲覧者向け（ログイン不要） |

## Vercel へのデプロイ

1. GitHub にプッシュ
2. [vercel.com](https://vercel.com) でリポジトリをインポート
3. 環境変数（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）を設定
4. デプロイ完了後、ドメインが発行されます
