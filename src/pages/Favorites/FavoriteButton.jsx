import { Heart } from 'iconoir-react'

export default function FavoriteButton({ isFavorite, onClick, recipeName }) {
  return (
    <button
      aria-label={isFavorite ? `Remove ${recipeName} from favorites` : `Add ${recipeName} to favorites`}
      className={isFavorite ? 'favorite-button is-favorite' : 'favorite-button'}
      onClick={onClick}
      type="button"
    >
      <Heart aria-hidden="true" />
    </button>
  )
}
