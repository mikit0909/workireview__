import { ArrowLeft, CalendarDays, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import StarRatingInput from '../components/StarRatingInput'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/helpers'
import { supabase } from '../lib/supabase'

export default function ReviewFormPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [rating, setRating] = useState(5)
  const [workStartedAt, setWorkStartedAt] = useState('')
  const [workEndedAt, setWorkEndedAt] = useState('')
  const [visaSecondOrThird, setVisaSecondOrThird] = useState(false)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadBusiness() {
      const { data, error: loadError } = await supabase.from('businesses').select('id, name').eq('id', id).single()

      if (ignore) return
      if (loadError) setError(getErrorMessage(loadError))
      else setBusiness(data)
      setLoading(false)
    }

    loadBusiness()

    return () => {
      ignore = true
    }
  }, [id])

  async function handleReviewSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const { error: saveError } = await supabase.from('reviews').insert({
      business_id: id,
      rating,
      work_started_on: workStartedAt ? `${workStartedAt}-01` : null,
      work_ended_on: workEndedAt ? `${workEndedAt}-01` : null,
      visa_2nd_3rd: visaSecondOrThird,
      comment,
      user_id: user.id,
    })

    setSaving(false)
    if (saveError) {
      setError(getErrorMessage(saveError))
      return
    }

    navigate(`/businesses/${id}`)
  }

  if (loading) return <main className="page narrow">読み込み中...</main>

  return (
    <main className="page review-only-page">
      <Link className="back-button" to={`/businesses/${id}`}>
        <ArrowLeft size={18} />
        詳細に戻る
      </Link>

      <section className="review-compose-card">
        <div className="review-compose-header">
          <span className="review-compose-icon">
            <Pencil size={28} />
          </span>
          <div>
            <p>Review</p>
            <h1>{business?.name || '口コミ対象'} のレビュー</h1>
          </div>
        </div>
        {error && <p className="alert error">{error}</p>}
        <form className="review-compose-form" onSubmit={handleReviewSubmit}>
          <section className="review-form-section">
            <label className="review-label">
              評価 *
              <StarRatingInput value={rating} onChange={setRating} />
            </label>
          </section>
          <section className="review-form-section">
            <div className="review-section-title">
              <CalendarDays size={20} />
              <span>勤務時期</span>
            </div>
            <div className="month-range">
              <label>
                開始
                <input type="month" value={workStartedAt} onChange={(event) => setWorkStartedAt(event.target.value)} />
              </label>
              <span>〜</span>
              <label>
                終了
                <input type="month" value={workEndedAt} onChange={(event) => setWorkEndedAt(event.target.value)} />
              </label>
            </div>
          </section>
          <section className="review-form-section">
            <label className="check-card">
              <input
                type="checkbox"
                checked={visaSecondOrThird}
                onChange={(event) => setVisaSecondOrThird(event.target.checked)}
              />
              <span>
                2nd, 3rd取得
              </span>
            </label>
          </section>
          <label className="review-label">
            口コミ *
            <textarea
              required
              minLength={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="体験を共有してください。良い点・悪い点など、率直なレビューが他のワーホリ仲間の役に立ちます。"
            />
          </label>
          <button className="button primary review-submit-button" type="submit" disabled={saving}>
            {saving ? '投稿中...' : 'レビューを投稿する →'}
          </button>
        </form>
      </section>
    </main>
  )
}
