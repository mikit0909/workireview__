import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/helpers'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function AuthPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (user) return <Navigate to="/mypage" replace />

  async function handleEmailAuth(event) {
    event.preventDefault()
    if (!isSupabaseConfigured) {
      setError('Supabaseの環境変数が未設定、またはanon keyに日本語・余計な文字が入っています。VITE_SUPABASE_ANON_KEY は eyJ で始まる長い英数字だけにしてください。')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname },
          emailRedirectTo: `${window.location.origin}/mypage`,
        },
      })
      if (signUpError) setError(getErrorMessage(signUpError))
      else if (data.session) navigate('/mypage')
      else setMessage('登録を受け付けました。確認メールが必要な設定の場合は、メール内のリンクから登録を完了してください。')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) setError(getErrorMessage(signInError))
    }

    setLoading(false)
  }

  return (
    <main className="page narrow">
      <div className="form-shell">
        <h1>{mode === 'signup' ? '新規登録' : 'ログイン'}</h1>
        <div className="segmented-control" role="tablist" aria-label="認証モード">
          <button className={mode === 'signin' ? 'active' : ''} type="button" onClick={() => setMode('signin')}>
            ログイン
          </button>
          <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => setMode('signup')}>
            新規登録
          </button>
        </div>
        {error && <p className="alert error">{error}</p>}
        {message && <p className="alert success">{message}</p>}
        <form className="stack-form" onSubmit={handleEmailAuth}>
          {mode === 'signup' && (
            <label>
              ニックネーム
              <input required value={nickname} onChange={(event) => setNickname(event.target.value)} />
            </label>
          )}
          <label>
            メールアドレス
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            パスワード
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? '処理中...' : mode === 'signup' ? '登録する' : 'ログインする'}
          </button>
        </form>
      </div>
    </main>
  )
}
