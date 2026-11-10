import { useState } from 'react'
import { getRecommendedRecipes, searchRecipes } from './api/meals'
import './App.css'

const homeRecipes = [
  { id: 'chicken', name: 'Chicken', image: '🍗' },
  { id: 'pasta', name: 'Pasta', image: '🍝' },
  { id: 'soup', name: 'Soup', image: '🍲' },
  { id: 'vegetables', name: 'Vegetables', image: '🥗' },
]

export default function App() {
  const [recipe, setRecipe] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [searchRecipesList, setSearchRecipesList] = useState([])
  const [recommendedRecipes, setRecommendedRecipes] = useState([])
  const [message, setMessage] = useState('')
  const [page, setPage] = useState('home')

  async function getRandomRecipe() {
    const response = await fetch(
      'https://www.themealdb.com/api/json/v1/1/random.php'
    )

    const data = await response.json()
    setRecipe(data.meals[0])
  }

  async function searchRecipe(event) {
    event.preventDefault()

    const text = searchText.trim()

    if (text === '') {
      setMessage('Write a recipe name first')
      return
    }

    try {
      setPage('search')
      setMessage('Loading recipes...')

      const foundRecipes = await searchRecipes(text)

      setSearchRecipesList(foundRecipes)

      if (foundRecipes.length === 0) {
        setMessage('No recipes found')
      } else {
        setMessage('')
      }
    } catch {
      setMessage('Could not load recipes')
    }
  }

  async function showAllRecipes() {
    try {
      setPage('recommended')
      setMessage('Loading recipes...')

      const foundRecipes = await getRecommendedRecipes()

      setRecommendedRecipes(foundRecipes)
      setMessage('')
    } catch {
      setMessage('Could not load recipes')
    }
  }

  function goHome() {
    setPage('home')
    setMessage('')
  }

  if (page === 'search') {
    return (
      <main className="result-page">
        <button className="back-button" onClick={goHome} type="button">
          ← Back
        </button>

        <h1>Search results</h1>
        <p className="search-title">You searched for: {searchText}</p>

        {message && <p>{message}</p>}

        <div className="result-list">
          {searchRecipesList.map((item) => (
            <article className="recipe-card" key={item.idMeal}>
              <img src={item.strMealThumb} alt={item.strMeal} />
              <h3>{item.strMeal}</h3>
            </article>
          ))}
        </div>
      </main>
    )
  }

  if (page === 'recommended') {
    return (
      <main className="result-page">
        <button className="back-button" onClick={goHome} type="button">
          ← Back
        </button>

        <h1>Recommended recipes</h1>
        <p className="search-title">More recipes for today</p>

        {message && <p>{message}</p>}

        <div className="result-list">
          {recommendedRecipes.map((item) => (
            <article className="recipe-card" key={item.idMeal}>
              <img src={item.strMealThumb} alt={item.strMeal} />
              <h3>{item.strMeal}</h3>
            </article>
          ))}
        </div>
      </main>
    )
  }

  return (
    <div className="page">
      <aside className="sidebar">
        <h1>CookIt</h1>

        <nav>
          <a href="#home">Home</a>
          <a href="#fridge">My Fridge</a>
          <a href="#recipes">Recipes</a>
          <a href="#favorites">Favorites</a>
          <a href="#profile">Profile</a>
        </nav>

        <p className="user-name">User Name</p>
      </aside>

      <main className="content" id="home">
        <form className="search" onSubmit={searchRecipe}>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search recipes or ingredients"
          />

          <button type="submit">Search</button>
        </form>

        <section className="recipe-day">
          <div className="recipe-day-content">
            <h2>Recipe of the day</h2>
            <p>Find something tasty today.</p>
            <button className="button" onClick={getRandomRecipe} type="button">
              Get random recipe
            </button>
            {recipe && <h3>{recipe.strMeal}</h3>}
          </div>

          <div className="recipe-day-info">
            <div className="recipe-tags">
              <span>{recipe ? recipe.strCategory : 'Recipe'}</span>
              <span>30 min</span>
              <span>Easy</span>
            </div>

            <p>
              {recipe
                ? `A tasty ${recipe.strMeal} recipe for today.`
                : 'Choose a random recipe to see it here.'}
            </p>

            <button className="recipe-info-button" type="button">
              View recipe →
            </button>
          </div>

          <div className="recipe-day-image">
            {recipe && <img src={recipe.strMealThumb} alt={recipe.strMeal} />}
            {!recipe && '🍲'}
          </div>
        </section>

        <section className="fridge" id="fridge">
          <h2>My fridge</h2>
          <div className="ingredients">
            <div className="ingredient">🥚<p>Eggs</p></div>
            <div className="ingredient">🥛<p>Milk</p></div>
            <div className="ingredient">🥕<p>Carrots</p></div>
            <div className="ingredient">🍎<p>Apples</p></div>
            <div className="ingredient">🧀<p>Cheese</p></div>
          </div>

          <a className="button" href="#recipes">Find a recipe</a>
        </section>

        <section className="recipes" id="recipes">
          <h2>Recommended today</h2>

          {message && <p>{message}</p>}

          <div className="recipe-list">
            {homeRecipes.map((item) => (
              <article className="recipe-card" key={item.id}>
                <div className="card-image">{item.image}</div>
                <h3>{item.name}</h3>
              </article>
            ))}

            <button className="view-all" onClick={showAllRecipes} type="button">
              <span>•••</span>
              View all
            </button>
          </div>
        </section>
      </main>

      <aside className="right-panel">
        <h2>demo - today's day of the week</h2>
        <p>demo - today's date</p>
      </aside>
    </div>
  )
}
