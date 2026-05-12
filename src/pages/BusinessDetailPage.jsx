import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FavoriteButton from '../components/FavoriteButton'
import { useAuth } from '../context/AuthContext'
import { categoryLabel, formatRating, getErrorMessage } from '../lib/helpers'
import { supabase } from '../lib/supabase'

function formatMonth(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

export default function BusinessDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDetail() {
    setLoading(true)
    setError('')

    const [{ data: businessData, error: businessError }, { data: reviewData, error: reviewError }] = await Promise.all([
      supabase.from('businesses_with_stats').select('*').eq('id', id).single(),
      supabase
        .from('reviews')
        .select('*')
        .eq('business_id', id)
        .order('created_at', { ascending: false }),
    ])

    if (businessError) {
      setError(getErrorMessage(businessError))
      setBusiness(null)
      setLoading(false)
      return
    }

    setBusiness(businessData)

    if (reviewError) {
      setError(getErrorMessage(reviewError))
      setReviews([])
      setLoading(false)
      return
    }

    const rows = reviewData || []
    const userIds = [...new Set(rows.map((review) => review.user_id).filter(Boolean))]

    if (!userIds.length) {
      setReviews(rows)
      setLoading(false)
      return
    }

    const { data: profiles } = await supabase.from('profiles').select('id, nickname').in('id', userIds)
    const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]))

    setReviews(rows.map((review) => ({ ...review, profile: profileMap.get(review.user_id) })))
    setLoading(false)
  }

  useEffect(() => {
    loadDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <main className="page narrow">読み込み中...</main>
  if (!business) return <main className="page narrow">見つかりませんでした。</main>

  return (
    <main className="page detail-layout">
      <section className="detail-main">
        <div className="detail-header">
          <div>
            <span className={`pill ${business.category}`}>{categoryLabel(business)}</span>
            <h1>{business.name}</h1>
          </div>
          <FavoriteButton businessId={business.id} />
        </div>

        <div className="rating-summary">
          <Star size={22} fill="currentColor" />
          <strong>{formatRating(business.avg_rating)}</strong>
          <span>{business.review_count || 0}件の口コミ</span>
        </div>

        <dl className="detail-list">
          <dt>都市</dt>
          <dd>{business.city}</dd>
          {business.category === 'job' && (
            <>
              <dt>Job詳細</dt>
              <dd>{business.station || '-'}</dd>
            </>
          )}
          <dt>エリア</dt>
          <dd>{business.area || '-'}</dd>
          <dt>通り</dt>
          <dd>{business.street || '-'}</dd>
          {business.category === 'house' && (
            <>
              <dt>最寄り駅</dt>
              <dd>{business.station || '-'}</dd>
            </>
          )}
          {business.category === 'house' && (
            <>
              <dt>家賃</dt>
              <dd>{business.rent || '-'}</dd>
              <dt>部屋タイプ</dt>
              <dd>{business.room_type || '-'}</dd>
            </>
          )}
        </dl>
      </section>

      <aside className="review-panel">
        <div className="review-panel-heading">
          <h2>口コミ</h2>
          {user && (
            <Link className="button primary compact-button" to={`/businesses/${business.id}/review`}>
              口コミを書く
            </Link>
          )}
        </div>
        {error && <p className="alert error">{error}</p>}
        {!user && (
          <div className="login-callout">
            <p>口コミを投稿するにはログインしてください。</p>
            <Link className="button secondary" to="/auth">
              ログイン
            </Link>
          </div>
        )}

        <div className="review-list">
          {reviews.length ? (
            reviews.map((review) => (
              <article key={review.id} className="review-item">
                <div className="review-meta">
                  <strong>{review.profile?.nickname || '匿名ユーザー'}</strong>
                  <span>
                    <Star size={15} fill="currentColor" />
                    {review.rating}
                  </span>
                </div>
                <p>{review.comment}</p>
                {(review.work_started_on || review.work_ended_on || review.visa_2nd_3rd) && (
                  <div className="review-tags">
                    {(review.work_started_on || review.work_ended_on) && (
                      <span>
                        時期: {formatMonth(review.work_started_on) || '不明'}〜
                        {formatMonth(review.work_ended_on) || '不明'}
                      </span>
                    )}
                    {review.visa_2nd_3rd && <span>2nd, 3rd取得</span>}
                  </div>
                )}
              </article>
            ))
          ) : (
            <p className="muted">まだ口コミがありません。</p>
          )}
        </div>
      </aside>
    </main>
  )
}
