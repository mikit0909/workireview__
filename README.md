# WorkiReview

ワーホリの失敗は、口コミで防げる。  
仕事・家の口コミを検索できるワーホリ情報プラットフォームです。

## 構成

- React + Vite
- Supabase Auth / PostgreSQL / RLS
- Vercel

## 主な機能

- メール認証
- ニックネーム付きプロフィール
- Business一覧、都市・カテゴリーフィルター、名前・エリア検索
- Business詳細、平均評価、口コミ一覧
- Business登録
- レビュー投稿
- お気に入り
- マイページ
- 利用規約、プライバシーポリシー、お問い合わせ

## セットアップ

```bash
npm install
cp .env.example .env
npm run dev
```

SupabaseのSQLは `supabase/schema.sql` を実行してください。  
詳しい公開手順は `docs/deploy.md` にまとめています。
