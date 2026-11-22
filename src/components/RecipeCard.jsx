import FavoriteButton from '../pages/Favorites/FavoriteButton'

export default function RecipeCard({ recipe, isFavorite, onOpenRecipe, onToggleFavorite }) {
  function openRecipe() {
    onOpenRecipe(recipe)
  }

  function toggleFavorite() {
    onToggleFavorite(recipe)
  }

  return (
    <article className="recipe-card">
      <button className="recipe-card-open" onClick={openRecipe} type="button">
        <img src={recipe.strMealThumb} alt={recipe.strMeal} />
        <h3>{recipe.strMeal}</h3>
      </button>
      <FavoriteButton
        isFavorite={isFavorite(recipe)}
        onClick={toggleFavorite}
        recipeName={recipe.strMeal}
      />
    </article>
  )
}
