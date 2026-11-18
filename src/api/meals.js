async function getMeals(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Could not load recipes')
  }

  const data = await response.json()
  return data.meals ?? []
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

export async function getRecommendedRecipes() {
  const recipes = await searchRecipes('chicken')
  return recipes.slice(0, 10)
}

export async function getDailyRecipe() {
  const response = await fetch(
    'https://www.themealdb.com/api/json/v1/1/random.php'
  )

  if (!response.ok) {
    throw new Error('Could not load the recipe of the day')
  }

  const data = await response.json()
  const recipe = data.meals?.[0]

  if (!recipe) {
    throw new Error('The recipe of the day is unavailable')
  }

  return recipe
}
