import FavoriteButton from '../pages/Favorites/FavoriteButton'

function getIngredients(recipe) {
  const ingredients = []

  for (let number = 1; number <= 20; number += 1) {
    const ingredient = recipe[`strIngredient${number}`]
    const measure = recipe[`strMeasure${number}`]

    if (ingredient && ingredient.trim()) {
      if (measure && measure.trim()) {
        ingredients.push(`${measure.trim()} ${ingredient.trim()}`)
      } else {
        ingredients.push(ingredient.trim())
      }
    }
  }

  return ingredients
}

function getVideoEmbedUrl(videoUrl) {
  if (!videoUrl) {
    return ''
  }

  try {
    const url = new URL(videoUrl)
    let videoId = ''

    if (url.hostname.includes('youtu.be')) {
      videoId = url.pathname.slice(1)
    } else {
      videoId = url.searchParams.get('v')
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }

    return ''
  } catch {
    return ''
  }
}

export default function RecipeDetail({ recipe, status, onClose, isFavorite, onToggleFavorite }) {
  if (!recipe && status !== 'loading') {
    return null
  }

  let videoEmbedUrl = ''

  if (recipe) {
    videoEmbedUrl = getVideoEmbedUrl(recipe.strYoutube)
  }

  function toggleFavorite() {
    onToggleFavorite(recipe)
  }

  return (
    <div className="recipe-detail-backdrop" role="presentation">
      <section aria-labelledby="recipe-detail-title" aria-modal="true" className="recipe-detail" role="dialog">
        <button aria-label="Close recipe" className="close-dialog-button" onClick={onClose} type="button">×</button>

        {status === 'loading' && <p className="dialog-message">Loading recipe...</p>}
        {status === 'error' && <p className="dialog-message">Could not load this recipe.</p>}

        {recipe && status === 'ready' && (
          <>
            <img className="recipe-detail-image" src={recipe.strMealThumb} alt={recipe.strMeal} />
            <div className="recipe-detail-content">
              <p className="recipe-detail-category">{recipe.strCategory} · {recipe.strArea}</p>
              <div className="recipe-detail-title-row">
                <h2 id="recipe-detail-title">{recipe.strMeal}</h2>
                <FavoriteButton isFavorite={isFavorite(recipe)} onClick={toggleFavorite} recipeName={recipe.strMeal} />
              </div>
              <h3>Ingredients</h3>
              <ul className="ingredient-list">
                {getIngredients(recipe).map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
              </ul>
              <h3>Instructions</h3>
              <p className="recipe-instructions">{recipe.strInstructions}</p>
              {videoEmbedUrl && (
                <div className="recipe-video">
                  <iframe allowFullScreen src={videoEmbedUrl} title={`${recipe.strMeal} video`} />
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
