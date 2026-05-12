import { Link } from 'react-router-dom'
import { MessageCircle, MapPin, PencilLine, Star } from 'lucide-react'
import FavoriteButton from './FavoriteButton'
import { categoryLabel, formatRating } from '../lib/helpers'

export default function BusinessCard({ business }) {
  return (
    <article className="business-card">
      <div className="card-topline">
        <span className={`pill ${business.category}`}>{categoryLabel(business)}</span>
        <FavoriteButton businessId={business.id} compact />
      </div>
      <Link to={`/businesses/${business.id}`}>
        <h3>{business.name}</h3>
      </Link>
      <p className="location">
        <MapPin size={16} />
        {business.city}
        {business.area ? ` / ${business.area}` : ''}
      </p>
      <div className="meta-row">
        <span>
          <Star size={16} fill="currentColor" />
          {formatRating(business.avg_rating)}
        </span>
        <span>{business.review_count || 0}件の口コミ</span>
      </div>
      <dl className="info-grid">
        {business.station && (
          <>
            <dt>{business.category === 'job' ? 'Job詳細' : '駅'}</dt>
            <dd>{business.station}</dd>
          </>
        )}
        {business.category === 'house' && business.rent && (
          <>
            <dt>家賃</dt>
            <dd>{business.rent}</dd>
          </>
        )}
      </dl>
      <div className="card-actions">
        <Link className="card-action secondary-action" to={`/businesses/${business.id}`}>
          <MessageCircle size={17} />
          口コミを見る
        </Link>
        <Link className="card-action" to={`/businesses/${business.id}/review`}>
          <PencilLine size={17} />
          口コミを書く
        </Link>
      </div>
    </article>
  )
}
