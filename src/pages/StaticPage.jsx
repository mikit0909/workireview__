const content = {
  terms: {
    title: '利用規約',
    body: [
      'WorkiReviewは、オーストラリアのワーキングホリデー・留学生活に関する仕事や住まいの口コミを共有するためのサービスです。',
      '投稿者は、事実に基づき、第三者の個人情報や権利を侵害しない内容を投稿してください。',
      '運営者は、不適切な投稿、虚偽情報、個人を特定できる情報、差別的または攻撃的な表現を削除できるものとします。',
    ],
  },
  privacy: {
    title: 'プライバシーポリシー',
    body: [
      'WorkiReviewは、認証、プロフィール表示、口コミ投稿、お気に入り機能の提供に必要な範囲でユーザー情報を取り扱います。',
      'メールアドレスはログインと本人確認のために利用し、公開画面には表示しません。',
      'Google認証を利用した場合、初回ログイン時にGoogleアカウント名をニックネームとしてプロフィールを作成します。',
    ],
  },
  contact: {
    title: 'お問い合わせ',
    body: [
      'サービスへのご意見、削除依頼、トラブル報告はGoogleフォームからご連絡ください。',
    ],
  },
}

const contactFormUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSdI7k6heQHYXMGdrvnhyQJPZ5FWcVDxNfG_p4_VE9dHlW-xhw/viewform?usp=publish-editor'

export default function StaticPage({ type }) {
  const page = content[type] || content.terms

  return (
    <main className="page narrow">
      <article className="static-page">
        <h1>{page.title}</h1>
        {page.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {type === 'contact' && (
          <a className="button primary" href={contactFormUrl} target="_blank" rel="noreferrer">
            お問い合わせフォームを開く
          </a>
        )}
      </article>
    </main>
  )
}
