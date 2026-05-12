# WorkiReview デプロイ手順

## 1. Supabaseプロジェクトを作成

1. Supabaseで新規プロジェクトを作成します。
2. `supabase/schema.sql` の内容をSQL Editorに貼り付けて一括実行します。
3. Project Settings > API から `Project URL` と `anon public key` を控えます。

## 2. Supabase認証を設定

Authentication > Providers で次を有効化します。

- Email
- Google

Google認証ではGoogle Cloud ConsoleでOAuthクライアントを作成し、SupabaseのCallback URLをGoogle側の承認済みリダイレクトURIに追加します。

Authentication > URL Configuration で下記を設定します。

- Site URL: `https://workireview.vercel.app`
- Redirect URLs:
  - `http://localhost:5173/**`
  - `https://workireview.vercel.app/**`

## 3. ローカル環境変数

`.env.example` を参考に `.env` を作成します。

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 4. ローカル確認

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## 5. GitHubへプッシュ

```bash
git init
git add .
git commit -m "Initial WorkiReview app"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/workireview.git
git push -u origin main
```

## 6. Vercelへデプロイ

1. VercelでGitHubリポジトリをImportします。
2. Framework Presetは `Vite` を選択します。
3. Environment Variablesに下記を追加します。
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deployを実行します。

独自ドメインやVercel URLが変わった場合は、SupabaseのURL Configurationにも同じURLを追加してください。
