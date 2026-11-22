import { Heart } from 'iconoir-react'

export default function FavoriteButton({ isFavorite, onClick, recipeName }) {
  let buttonLabel = `Add ${recipeName} to favorites`
  let className = 'favorite-button'

  if (isFavorite) {
    buttonLabel = `Remove ${recipeName} from favorites`
    className = 'favorite-button is-favorite'
  }

  return (
    <button
      aria-label={buttonLabel}
      className={className}
      onClick={onClick}
      type="button"
    >
      <Heart aria-hidden="true" />
    </button>
  )
}
