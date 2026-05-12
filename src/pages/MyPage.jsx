import { LogOut, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BusinessCard from '../components/BusinessCard'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/helpers'
import { supabase } from '../lib/supabase'

export default function MyPage() {
  const { user, profile, setProfile } = useAuth()
  const [nickname, setNickname] = useState('')
  const [favorites, setFavorites] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setNickname(profile?.nickname || '')
  }, [profile])

  useEffect(() => {
    let ignore = false

    async function loadFavorites() {
      const { data: favoriteRows, error: favoriteError } = await supabase
        .from('favorites')
        .select('business_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ignore) return
      if (favoriteError) {
        setError(getErrorMessage(favoriteError))
        return
      }

      const ids = (favoriteRows || []).map((item) => item.business_id)
      if (!ids.length) {
        setFavorites([])
        return
      }

      const { data: businessRows, error: businessError } = await supabase
        .from('businesses_with_stats')
        .select('*')
        .in('id', ids)

      if (ignore) return
      if (businessError) setError(getErrorMessage(businessError))
      else setFavorites(ids.map((id) => businessRows.find((business) => business.id === id)).filter(Boolean))
    }

    loadFavorites()

    return () => {
      ignore = true
    }
  }, [user.id])

  async function updateProfile(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const { data, error: saveError } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user.id)
      .select('*')
      .single()

    if (saveError) setError(getErrorMessage(saveError))
    else {
      setProfile(data)
      setMessage('ニックネームを更新しました。')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <main className="page">
      <section className="profile-layout">
        <div className="form-shell">
          <h1>マイページ</h1>
          <dl className="detail-list compact-list">
            <dt>メール</dt>
            <dd>{user.email}</dd>
          </dl>
          {error && <p className="alert error">{error}</p>}
          {message && <p className="alert success">{message}</p>}
          <form className="stack-form" onSubmit={updateProfile}>
            <label>
              ニックネーム
              <input required value={nickname} onChange={(event) => setNickname(event.target.value)} />
            </label>
            <button className="button primary" type="submit">
              <Save size={18} />
              保存
            </button>
          </form>
          <button className="button secondary full" type="button" onClick={signOut}>
            <LogOut size={18} />
            ログアウト
          </button>
        </div>

        <div>
          <div className="section-heading">
            <h2>お気に入り</h2>
            <span>{favorites.length}件</span>
          </div>
          {favorites.length ? (
            <div className="business-grid small">
              {favorites.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>お気に入りはまだありません。</p>
              <Link className="button secondary" to="/">
                口コミを探す
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
