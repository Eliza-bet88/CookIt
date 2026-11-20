import { Search } from 'iconoir-react'
import { useState } from 'react'
import FavoriteButton from './FavoriteButton'

export default function FavoritesPage({ favoriteRecipes, isFavorite, onOpenRecipe, onToggleFavorite }) {
  const [searchText, setSearchText] = useState('')
  const visibleRecipes = favoriteRecipes.filter((recipe) => (
    recipe.strMeal.toLowerCase().includes(searchText.trim().toLowerCase())
  ))

  return (
    <main className="favorites-page">
      <h1>Favorites</h1>

      <label className="favorites-search">
        <Search aria-hidden="true" />
        <input
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search recipes or ingredients..."
          value={searchText}
        />
      </label>

      {visibleRecipes.length === 0 ? (
        <p className="favorites-empty">Your saved recipes will appear here.</p>
      ) : (
        <div className="favorites-list">
          {visibleRecipes.map((recipe) => (
            <article className="favorite-recipe-card" key={recipe.idMeal}>
              <img alt={recipe.strMeal} src={recipe.strMealThumb} />
              <div className="favorite-recipe-content">
                <h2>{recipe.strMeal}</h2>
                <button onClick={() => onOpenRecipe(recipe)} type="button">View recipe</button>
              </div>
              <FavoriteButton
                isFavorite={isFavorite(recipe)}
                onClick={() => onToggleFavorite(recipe)}
                recipeName={recipe.strMeal}
              />
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
