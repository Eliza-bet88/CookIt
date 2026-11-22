import { useEffect, useState } from 'react'
import { EditPencil, User } from 'iconoir-react'
import ProductIcon from '../MyFridge/ProductIcon'
import { searchRecipes } from '../../api/meals'
import FavoriteButton from '../Favorites/FavoriteButton'

const recipesStorageName = 'cookit.ingredient-recipes'

function getRecipeKey(products) {
  return products
    .map((product) => product.name.toLowerCase())
    .sort()
    .join('|')
}

function getSavedRecipes(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(recipesStorageName))
    return saved?.key === key && Array.isArray(saved.recipes) ? saved.recipes : []
  } catch {
    return []
  }
}

function saveRecipes(key, recipes) {
  try {
    localStorage.setItem(recipesStorageName, JSON.stringify({ key, recipes }))
  } catch {
    return
  }
}

function getRecipesWithIngredientMatches(recipeLists) {
  const recipesById = new Map()

  recipeLists.flat().forEach((recipe) => {
    const savedRecipe = recipesById.get(recipe.idMeal)
    const matchingIngredientCount = savedRecipe
      ? savedRecipe.matchingIngredientCount + 1
      : 1

    recipesById.set(recipe.idMeal, { ...recipe, matchingIngredientCount })
  })

  return [...recipesById.values()].sort(
    (first, second) => second.matchingIngredientCount - first.matchingIngredientCount
  )
}

export default function RecipesPage({ products, onEditIngredients, onOpenRecipe, onToggleFavorite, isFavorite }) {
  const [recipesWithIngredientMatches, setRecipesWithIngredientMatches] = useState([])
  const [recipeLoadingStatus, setRecipeLoadingStatus] = useState('idle')

  useEffect(() => {
    let isPageOpen = true

    async function loadRecipes() {
      if (products.length === 0) {
        setRecipesWithIngredientMatches([])
        setRecipeLoadingStatus('empty')
        return
      }

      const key = getRecipeKey(products)
      const savedRecipes = getSavedRecipes(key)

      if (savedRecipes.length > 0) {
        setRecipesWithIngredientMatches(savedRecipes)
        setRecipeLoadingStatus('ready')
        return
      }

      setRecipeLoadingStatus('loading')

      try {
        const recipeLists = []

        for (let index = 0; index < products.length; index += 3) {
          const productGroup = products.slice(index, index + 3)
          const results = await Promise.allSettled(
            productGroup.map((product) => searchRecipes(product.name))
          )

          results.forEach((result) => {
            if (result.status === 'fulfilled') recipeLists.push(result.value)
          })

          if (isPageOpen && recipeLists.length > 0) {
            const recipes = getRecipesWithIngredientMatches(recipeLists)
            saveRecipes(key, recipes)
            setRecipesWithIngredientMatches(recipes)
            setRecipeLoadingStatus('ready')
          }
        }

        if (isPageOpen && recipeLists.length === 0) {
          setRecipeLoadingStatus('error')
        }
      } catch {
        if (isPageOpen) setRecipeLoadingStatus('error')
      }
    }

    loadRecipes()

    return () => { isPageOpen = false }
  }, [products])

  return (
    <main className="recipes-page">
      <header className="recipes-header">
        <h1>Find a recipe</h1>
        <p>Your ingredients:</p>

        <div className="recipe-ingredients-row">
          {products.map((product) => (
            <div className="recipe-ingredient-pill" key={product.id}>
              <ProductIcon product={product} />
              <span>{product.name}</span>
            </div>
          ))}

          <button className="edit-ingredients-button" onClick={onEditIngredients} type="button">
            <EditPencil aria-hidden="true" />
            Edit ingredients
          </button>
        </div>
      </header>

      {recipeLoadingStatus === 'loading' && <p className="recipes-message">Looking for recipes with your ingredients…</p>}

      {recipeLoadingStatus === 'empty' && (
        <div className="recipes-empty">
          <h2>Your fridge is empty</h2>
          <p>Add ingredients to your fridge and we’ll find recipes that match them.</p>
          <button onClick={onEditIngredients} type="button">Go to My Fridge</button>
        </div>
      )}

      {recipeLoadingStatus === 'error' && <p className="recipes-message">Recipes could not be loaded. Please try again.</p>}

      {recipeLoadingStatus === 'ready' && recipesWithIngredientMatches.length === 0 && (
        <p className="recipes-message">No recipes found with these ingredients yet.</p>
      )}

      <div className="ingredient-recipe-grid">
        {recipesWithIngredientMatches.map((recipe) => (
          <article className="ingredient-recipe-card" key={recipe.idMeal}>
            <button className="ingredient-recipe-open" onClick={() => onOpenRecipe(recipe)} type="button">
              <img alt={recipe.strMeal} src={recipe.strMealThumb} />
              <div>
              <h2>{recipe.strMeal}</h2>
              <p>
                <User aria-hidden="true" /> {recipe.matchingIngredientCount} ingredient match{recipe.matchingIngredientCount > 1 ? 'es' : ''}
              </p>
              </div>
            </button>
            <FavoriteButton isFavorite={isFavorite(recipe)} onClick={() => onToggleFavorite(recipe)} recipeName={recipe.strMeal} />
          </article>
        ))}
      </div>
    </main>
  )
}
