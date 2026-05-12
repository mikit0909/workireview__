import { PlusCircle, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import BusinessCard from '../components/BusinessCard'
import { CATEGORIES, CITIES } from '../lib/constants'
import { getErrorMessage } from '../lib/helpers'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [businesses, setBusinesses] = useState([])
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadBusinesses() {
      setLoading(true)
      setError('')

      let request = supabase.from('businesses_with_stats').select('*').order('created_at', { ascending: false })
      if (city) request = request.eq('city', city)
      if (category) request = request.eq('category', category)

      const { data, error: loadError } = await request

      if (ignore) return
      if (loadError) {
        setError(getErrorMessage(loadError))
        setBusinesses([])
      } else {
        setBusinesses(data || [])
      }
      setLoading(false)
    }

    loadBusinesses()

    return () => {
      ignore = true
    }
  }, [city, category])

  const filteredBusinesses = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return businesses

    return businesses.filter((business) =>
      [business.name, business.area, business.city, business.station]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized)),
    )
  }, [businesses, query])

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Australia Working Holiday Reviews</p>
          <h1>
            ワーホリの失敗は、
            <br />
            口コミで防げる。
          </h1>
          <p className="hero-description">
            ワーホリでは、仕事やシェアハウスの情報のほとんどがFacebookグループに集まっています。
            <br />
            でもその情報は、検索しづらく、蓄積されず、信頼性もバラバラです。
            <br />
            このプラットフォームでは、実際に経験した方のリアルな声を残し、
            <br />
            次の誰かの選択が少しでも良くなる場所になれば幸いです。
          </p>
        </div>
      </section>

      <section className="search-panel" aria-label="検索条件">
        <label className="search-box">
          <Search size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="名前・エリアで検索"
          />
        </label>
        <div className="filter-row">
          <select value={city} onChange={(event) => setCity(event.target.value)} aria-label="都市">
            <option value="">すべての都市</option>
            {CITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="カテゴリー">
            <option value="">すべてのカテゴリー</option>
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="page">
        <div className="section-heading">
          <h2>口コミ対象を探す</h2>
          <span>{filteredBusinesses.length}件</span>
        </div>
        {error && <p className="alert error">{error}</p>}
        {loading ? (
          <div className="empty-state">読み込み中...</div>
        ) : filteredBusinesses.length ? (
          <div className="business-grid">
            {filteredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>まだ口コミ対象がありません</h2>
            <p>まずは口コミを書きたい仕事や家を登録してください。登録後、その詳細ページで口コミを書けます。</p>
            <Link className="button primary" to="/new">
              <PlusCircle size={18} />
              口コミ対象を登録
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
