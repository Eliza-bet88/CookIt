export async function searchRecipes(searchText) {
  const response = await fetch(
    'https://www.themealdb.com/api/json/v1/1/search.php?s=' +
      encodeURIComponent(searchText)
  )

  if (!response.ok) {
    throw new Error('Could not load recipes')
  }

  const data = await response.json()

  if (data.meals) {
    return data.meals
  }

  return []
}

export async function getRecommendedRecipes() {
  const recipes = await searchRecipes('chicken')
  return recipes.slice(0, 10)
}
