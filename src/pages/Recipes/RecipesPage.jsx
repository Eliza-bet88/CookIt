import { useEffect, useState } from 'react'
import { Clock, EditPencil, Search, User } from 'iconoir-react'
import ProductIcon from '../MyFridge/ProductIcon'
import { searchRecipes } from '../../api/meals'

const mealTypes = ['All meals', 'Breakfast', 'Lunch', 'Dinner', 'Something sweet']
const cookingTimes = ['Any time', 'Under 20 min', 'Under 40 min', 'Slow & steady']

function getCookingTime(recipe) {
  let ingredients = 0

  for (let number = 1; number <= 20; number += 1) {
    if (recipe[`strIngredient${number}`]) ingredients += 1
  }

  return Math.max(10, ingredients * 5)
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

function recipeMatchesFilters(recipe, recipeSearchText, selectedMeal, cookingTime) {
  const recipeTime = getCookingTime(recipe)
  const nameMatches = recipe.strMeal.toLowerCase().includes(
    recipeSearchText.trim().toLowerCase()
  )
  const selectedCategory = selectedMeal === 'Something sweet'
    ? 'dessert'
    : selectedMeal.toLowerCase()
  const mealMatches = selectedMeal === 'All meals'
    || recipe.strCategory?.toLowerCase().includes(selectedCategory)
  const timeMatches = cookingTime === 'Any time'
    || (cookingTime === 'Under 20 min' && recipeTime < 20)
    || (cookingTime === 'Under 40 min' && recipeTime < 40)
    || (cookingTime === 'Slow & steady' && recipeTime >= 40)

  return nameMatches && mealMatches && timeMatches
}

export default function RecipesPage({ products, onEditIngredients, onOpenRecipe }) {
  const [recipesWithIngredientMatches, setRecipesWithIngredientMatches] = useState([])
  const [recipeLoadingStatus, setRecipeLoadingStatus] = useState('idle')
  const [recipeSearchText, setRecipeSearchText] = useState('')
  const [selectedMeal, setSelectedMeal] = useState('All meals')
  const [cookingTime, setCookingTime] = useState('Any time')

  useEffect(() => {
    let isPageOpen = true

    async function loadRecipes() {
      if (products.length === 0) {
        setRecipesWithIngredientMatches([])
        setRecipeLoadingStatus('empty')
        return
      }

      setRecipeLoadingStatus('loading')

      try {
        const recipeLists = await Promise.all(
          products.map((product) => searchRecipes(product.name))
        )

        if (isPageOpen) {
          setRecipesWithIngredientMatches(getRecipesWithIngredientMatches(recipeLists))
          setRecipeLoadingStatus('ready')
        }
      } catch {
        if (isPageOpen) setRecipeLoadingStatus('error')
      }
    }

    loadRecipes()

    return () => { isPageOpen = false }
  }, [products])

  const visibleRecipes = recipesWithIngredientMatches.filter((recipe) => (
    recipeMatchesFilters(recipe, recipeSearchText, selectedMeal, cookingTime)
  ))

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

      <section className="recipe-filters" aria-label="Recipe filters">
        <label className="recipes-search">
          <Search aria-hidden="true" />
          <input
            onChange={(event) => setRecipeSearchText(event.target.value)}
            placeholder="Search recipes..."
            value={recipeSearchText}
          />
        </label>

        <label>
          <span>Meal</span>
          <select onChange={(event) => setSelectedMeal(event.target.value)} value={selectedMeal}>
            {mealTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>

        <label>
          <span>Cooking time</span>
          <select onChange={(event) => setCookingTime(event.target.value)} value={cookingTime}>
            {cookingTimes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </section>

      {recipeLoadingStatus === 'loading' && <p className="recipes-message">Looking for recipes with your ingredients…</p>}

      {recipeLoadingStatus === 'empty' && (
        <div className="recipes-empty">
          <h2>Your fridge is empty</h2>
          <p>Add ingredients to your fridge and we’ll find recipes that match them.</p>
          <button onClick={onEditIngredients} type="button">Go to My Fridge</button>
        </div>
      )}

      {recipeLoadingStatus === 'error' && <p className="recipes-message">Recipes could not be loaded. Please try again.</p>}

      {recipeLoadingStatus === 'ready' && visibleRecipes.length === 0 && (
        <p className="recipes-message">No recipes match these filters yet.</p>
      )}

      <div className="ingredient-recipe-grid">
        {visibleRecipes.map((recipe) => (
          <button
            className="ingredient-recipe-card"
            key={recipe.idMeal}
            onClick={() => onOpenRecipe(recipe)}
            type="button"
          >
            <img alt={recipe.strMeal} src={recipe.strMealThumb} />
            <div>
              <h2>{recipe.strMeal}</h2>
              <p>
                <Clock aria-hidden="true" /> {getCookingTime(recipe)} min
                <User aria-hidden="true" /> {recipe.matchingIngredientCount} ingredient match{recipe.matchingIngredientCount > 1 ? 'es' : ''}
              </p>
            </div>
          </button>
        ))}
      </div>
    </main>
  )
}
