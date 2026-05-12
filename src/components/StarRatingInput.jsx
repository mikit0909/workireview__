import { Star } from 'lucide-react'

export default function StarRatingInput({ value, onChange }) {
  return (
    <div className="star-input" role="radiogroup" aria-label="評価">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          className={rating <= value ? 'selected' : ''}
          onClick={() => onChange(rating)}
          aria-label={`${rating} stars`}
        >
          <Star size={28} fill={rating <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}
