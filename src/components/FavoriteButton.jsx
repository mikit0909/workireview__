import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function FavoriteButton({ businessId, compact = false }) {
  const { user } = useAuth()
  const [favoriteId, setFavoriteId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadFavorite() {
      if (!user || !businessId) {
        setFavoriteId(null)
        return
      }

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('business_id', businessId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!ignore) setFavoriteId(data?.id ?? null)
    }

    loadFavorite()

    return () => {
      ignore = true
    }
  }, [businessId, user])

  async function toggleFavorite(event) {
    event.preventDefault()
    event.stopPropagation()

    if (!user) return
    setLoading(true)

    if (favoriteId) {
      const { error } = await supabase.from('favorites').delete().eq('id', favoriteId)
      if (!error) setFavoriteId(null)
    } else {
      const { data, error } = await supabase
        .from('favorites')
        .insert({ business_id: businessId, user_id: user.id })
        .select('id')
        .single()
      if (!error) setFavoriteId(data.id)
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <Link className={`favorite-button ${compact ? 'compact' : ''}`} to="/auth" aria-label="ログインしてお気に入りに追加">
        <Heart size={18} />
      </Link>
    )
  }

  return (
    <button
      className={`favorite-button ${favoriteId ? 'active' : ''} ${compact ? 'compact' : ''}`}
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={favoriteId ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <Heart size={18} fill={favoriteId ? 'currentColor' : 'none'} />
    </button>
  )
}
