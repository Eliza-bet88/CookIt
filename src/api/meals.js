async function getMeals(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Could not load recipes')
  }

  const data = await response.json()

  if (data.meals) {
    return data.meals
  }

  return []
}

export async function getRecipeById(id) {
  const recipes = await getMeals(
    'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' +
      encodeURIComponent(id)
  )

  if (!recipes[0]) {
    throw new Error('Recipe not found')
  }

  return recipes[0]
}

export async function searchRecipes(searchText) {
  const search = searchText.trim().toLowerCase()
  const urls = [
    'https://www.themealdb.com/api/json/v1/1/search.php?s=' +
      encodeURIComponent(search),
    'https://www.themealdb.com/api/json/v1/1/filter.php?i=' +
      encodeURIComponent(search),
  ]

  if (search.endsWith('s') && search.length > 1) {
    urls.push(
      'https://www.themealdb.com/api/json/v1/1/filter.php?i=' +
        encodeURIComponent(search.slice(0, -1))
    )
  }

  const results = await Promise.all(urls.map(getMeals))
  const recipes = new Map()

  for (const list of results) {
    for (const recipe of list) {
      recipes.set(recipe.idMeal, recipe)
    }
  }

  return [...recipes.values()]
}

const cuisineAreas = {
  Asian: ['Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese'],
  European: ['British', 'French', 'Greek', 'Italian', 'Polish', 'Portuguese', 'Spanish'],
  American: ['American', 'Canadian', 'Mexican'],
  Italian: ['Italian'],
  Indian: ['Indian'],
  MiddleEastern: ['Turkish'],
  Caribbean: ['Jamaican'],
}

export async function getRecommendedRecipes(favoriteCuisines = []) {
  const areas = []

  for (const cuisine of favoriteCuisines) {
    const cuisineAreasList = cuisineAreas[cuisine]

    if (cuisineAreasList) {
      areas.push(...cuisineAreasList)
    }
  }

  const preferredRecipeLists = []

  for (const area of areas) {
    const recipes = await getMeals(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`
    )
    preferredRecipeLists.push(recipes)
  }

  const chickenRecipes = await getMeals('https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken')
  const recipesById = new Map()

  for (const recipeList of preferredRecipeLists) {
    for (const recipe of recipeList) {
      recipesById.set(recipe.idMeal, recipe)
    }
  }

  for (const recipe of chickenRecipes) {
    recipesById.set(recipe.idMeal, recipe)
  }

  return [...recipesById.values()].slice(0, 10)
}

export async function getDailyRecipe() {
  const response = await fetch(
    'https://www.themealdb.com/api/json/v1/1/random.php'
  )

  if (!response.ok) {
    throw new Error('Could not load the recipe of the day')
  }

  const data = await response.json()
  let recipe = null

  if (data.meals) {
    recipe = data.meals[0]
  }

  if (!recipe) {
    throw new Error('The recipe of the day is unavailable')
  }

  return recipe
}
