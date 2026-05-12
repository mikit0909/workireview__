export function categoryLabel(business) {
  if (!business) return ''
  if (business.category === 'house') return 'House'
  if (business.category === 'job') return 'Job'
  return business.category_other || 'Other'
}

export function formatRating(value) {
  if (value === null || value === undefined) return '未評価'
  return Number(value).toFixed(1)
}

export function getErrorMessage(error) {
  return error?.message || '処理に失敗しました。時間をおいて再度お試しください。'
}
