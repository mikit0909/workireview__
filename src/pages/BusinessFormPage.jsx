import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, CITIES } from '../lib/constants'
import { getErrorMessage } from '../lib/helpers'
import { supabase } from '../lib/supabase'

const initialForm = {
  name: '',
  city: 'Sydney',
  category: 'house',
  category_other: '',
  area: '',
  street: '',
  station: '',
  rent: '',
  room_type: '',
}

export default function BusinessFormPage() {
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      category_other: form.category === 'other' ? form.category_other : null,
      station: form.category === 'other' ? null : form.station,
      rent: form.category === 'house' ? form.rent : null,
      room_type: form.category === 'house' ? form.room_type : null,
      user_id: user.id,
    }

    const { data, error: saveError } = await supabase.from('businesses').insert(payload).select('id').single()

    setSaving(false)
    if (saveError) {
      setError(getErrorMessage(saveError))
      return
    }
    navigate(`/businesses/${data.id}`)
  }

  return (
    <main className="page narrow">
      <div className="form-shell">
        <h1>仕事や家の新規登録</h1>
        <p>仕事・家・その他の口コミ対象を登録できます。住所そのものは入力せず、公開可能な範囲だけ登録してください。</p>
        {error && <p className="alert error">{error}</p>}
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            カテゴリー
            <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {form.category === 'other' && (
            <label>
              カテゴリー詳細
              <input
                required
                value={form.category_other}
                onChange={(event) => updateField('category_other', event.target.value)}
              />
            </label>
          )}
          <label>
            名前
            <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          </label>
          <label>
            都市
            <select value={form.city} onChange={(event) => updateField('city', event.target.value)}>
              {CITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          {form.category === 'job' && (
            <label>
              Job詳細
              <input
                value={form.station}
                onChange={(event) => updateField('station', event.target.value)}
                placeholder="例: レストラン / ファーム / クリーナー"
              />
            </label>
          )}
          <div className="two-column">
            <label>
              エリア
              <input required value={form.area} onChange={(event) => updateField('area', event.target.value)} />
            </label>
            <label>
              通り
              <input value={form.street} onChange={(event) => updateField('street', event.target.value)} />
            </label>
          </div>
          {form.category === 'house' && (
            <label>
              最寄り駅
              <input value={form.station} onChange={(event) => updateField('station', event.target.value)} />
            </label>
          )}
          {form.category === 'house' && (
            <div className="two-column">
              <label>
                家賃
                <input value={form.rent} onChange={(event) => updateField('rent', event.target.value)} />
              </label>
              <label>
                部屋タイプ
                <input value={form.room_type} onChange={(event) => updateField('room_type', event.target.value)} />
              </label>
            </div>
          )}
          <button className="button primary" type="submit" disabled={saving}>
            {saving ? '登録中...' : '登録する'}
          </button>
        </form>
      </div>
    </main>
  )
}
