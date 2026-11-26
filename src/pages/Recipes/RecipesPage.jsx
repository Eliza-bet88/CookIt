import { useEffect, useState } from 'react'
import { EditPencil, User } from 'iconoir-react'
import ProductIcon from '../MyFridge/ProductIcon'
import { searchRecipes } from '../../api/meals'
import FavoriteButton from '../Favorites/FavoriteButton'

function recipesStorageName(userId) {
  return `cookit.${userId}.ingredient-recipes`
}

function getRecipeKey(products) {
  const productNames = []

  for (const product of products) {
    productNames.push(product.name.toLowerCase())
  }

  productNames.sort()
  return productNames.join('|')
}

function getSavedRecipes(key, userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(recipesStorageName(userId)))

    if (saved && saved.key === key && Array.isArray(saved.recipes)) {
      return saved.recipes
    }

    return []
  } catch {
    return []
  }
}

function saveRecipes(key, recipes, userId) {
  try {
    localStorage.setItem(recipesStorageName(userId), JSON.stringify({ key, recipes }))
  } catch {
    return
  }
}

function getRecipesWithIngredientMatches(recipeLists) {
  const recipesById = new Map()

  for (const recipeList of recipeLists) {
    for (const recipe of recipeList) {
      const savedRecipe = recipesById.get(recipe.idMeal)
      let matchingIngredientCount = 1

      if (savedRecipe) {
        matchingIngredientCount = savedRecipe.matchingIngredientCount + 1
      }

      recipesById.set(recipe.idMeal, { ...recipe, matchingIngredientCount })
    }
  }

  const recipes = [...recipesById.values()]
  recipes.sort((first, second) => second.matchingIngredientCount - first.matchingIngredientCount)
  return recipes
}

function getIngredientMatchText(count) {
  if (count === 1) {
    return 'ingredient match'
  }

  return 'ingredient matches'
}

export default function RecipesPage({ products, userId, onEditIngredients, onOpenRecipe, onToggleFavorite, isFavorite }) {
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
      const savedRecipes = getSavedRecipes(key, userId)

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
        }

        if (!isPageOpen) {
          return
        }

        if (recipeLists.length === 0) {
          setRecipeLoadingStatus('error')
          return
        }

        const recipes = getRecipesWithIngredientMatches(recipeLists)
        saveRecipes(key, recipes, userId)
        setRecipesWithIngredientMatches(recipes)
        setRecipeLoadingStatus('ready')
      } catch {
        if (isPageOpen) setRecipeLoadingStatus('error')
      }
    }

    loadRecipes()

    return () => { isPageOpen = false }
  }, [products, userId])

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
                <User aria-hidden="true" /> {recipe.matchingIngredientCount} {getIngredientMatchText(recipe.matchingIngredientCount)}
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
