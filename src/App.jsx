import { useEffect, useState } from 'react'
import {
  getDailyRecipe,
  getRecommendedRecipes,
  searchRecipes,
} from './api/meals'
import './App.css'

const storageName = 'cookit.daily-recipe'
const historyStorageName = 'cookit.recipe-history'
const historyPreviewSize = 4

const homeRecipes = [
  { id: 'chicken', name: 'Chicken', image: '🍗' },
  { id: 'pasta', name: 'Pasta', image: '🍝' },
  { id: 'soup', name: 'Soup', image: '🍲' },
  { id: 'vegetables', name: 'Vegetables', image: '🥗' },
]

function getRecipeDetails(recipe) {
  let ingredients = 0

  for (let number = 1; number <= 20; number += 1) {
    if (recipe[`strIngredient${number}`]?.trim()) {
      ingredients += 1
    }
  }

  const estimatedMinutes = Math.max(15, ingredients * 5)
  let difficulty = 'Easy'
  if (ingredients > 12) {
    difficulty = 'Hard'
  } else if (ingredients > 7) {
    difficulty = 'Medium'
  }

  return { estimatedMinutes, difficulty }
}

export default function App() {
  const [recipe, setRecipe] = useState(null)
  const [dailyRecipeStatus, setDailyRecipeStatus] = useState('loading')
  const [searchText, setSearchText] = useState('')
  const [searchRecipesList, setSearchRecipesList] = useState([])
  const [recommendedRecipes, setRecommendedRecipes] = useState([])
  const [recipeHistory, setRecipeHistory] = useState(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem(historyStorageName))
      return Array.isArray(savedHistory) ? savedHistory : []
    } catch {
      localStorage.removeItem(historyStorageName)
      return []
    }
  })
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [page, setPage] = useState('home')

  useEffect(() => {
    let pageIsOpen = true
    let timer

    async function loadDailyRecipe() {
      const today = new Date().toDateString()
      let savedRecipe = null

      try {
        savedRecipe = JSON.parse(localStorage.getItem(storageName))
      } catch {
        localStorage.removeItem(storageName)
      }

      if (savedRecipe?.date === today && savedRecipe.recipe) {
        if (pageIsOpen) {
          setRecipe(savedRecipe.recipe)
          setDailyRecipeStatus('ready')
        }
      } else {
        setDailyRecipeStatus('loading')

        try {
          const newRecipe = await getDailyRecipe()

          localStorage.setItem(
            storageName,
            JSON.stringify({ date: today, recipe: newRecipe })
          )

          if (pageIsOpen) {
            setRecipe(newRecipe)
            setDailyRecipeStatus('ready')
          }
        } catch {
          if (pageIsOpen) {
            setDailyRecipeStatus('error')
          }
        }
      }

      const nextMidnight = new Date()
      nextMidnight.setHours(24, 0, 0, 0)
      timer = window.setTimeout(
        loadDailyRecipe,
        nextMidnight.getTime() - Date.now()
      )
    }

    loadDailyRecipe()

    return () => {
      pageIsOpen = false
      clearTimeout(timer)
    }
  }, [])

  function saveRecipeToHistory(recipeToSave) {
    if (!recipeToSave) {
      return
    }

    const savedRecipe = {
      idMeal: recipeToSave.idMeal,
      strMeal: recipeToSave.strMeal,
      strMealThumb: recipeToSave.strMealThumb,
    }

    const updatedHistory = [
      savedRecipe,
      ...recipeHistory.filter((item) => item.idMeal !== savedRecipe.idMeal),
    ].slice(0, 100)

    setRecipeHistory(updatedHistory)
    localStorage.setItem(historyStorageName, JSON.stringify(updatedHistory))
  }

  function clearRecipeHistory() {
    setRecipeHistory([])
    localStorage.removeItem(historyStorageName)
    setIsHistoryOpen(false)
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

  const recipeDetails = recipe ? getRecipeDetails(recipe) : null

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
            <button
              className="recipe-card"
              key={item.idMeal}
              onClick={() => saveRecipeToHistory(item)}
              type="button"
            >
              <img src={item.strMealThumb} alt={item.strMeal} />
              <h3>{item.strMeal}</h3>
            </button>
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
            <button
              className="recipe-card"
              key={item.idMeal}
              onClick={() => saveRecipeToHistory(item)}
              type="button"
            >
              <img src={item.strMealThumb} alt={item.strMeal} />
              <h3>{item.strMeal}</h3>
            </button>
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
            <div className="recipe-tags">
              <span>{recipe ? recipe.strCategory : 'Recipe'}</span>
              <span>{recipeDetails ? `≈ ${recipeDetails.estimatedMinutes} min` : '—'}</span>
              <span>{recipeDetails ? recipeDetails.difficulty : '—'}</span>
            </div>

            <h2>
              Recipe of
              <br />
              the day
            </h2>

            <p className="recipe-day-description">
              {recipe
                ? `A tasty ${recipe.strMeal} recipe for today.`
                : 'Your recipe of the day is being prepared.'}
            </p>

            <button
              className="recipe-info-button"
              disabled={!recipe}
              onClick={() => saveRecipeToHistory(recipe)}
              type="button"
            >
              View recipe <span aria-hidden="true">→</span>
            </button>

            {dailyRecipeStatus === 'loading' && <p>Loading today&apos;s recipe…</p>}
            {dailyRecipeStatus === 'error' && (
              <p>Today&apos;s recipe could not be loaded. Please refresh the page.</p>
            )}
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
        <section className="today-date">
          <h2>
            {new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
              new Date()
            )}
          </h2>
          <p>
            {new Intl.DateTimeFormat('en-US', {
              month: 'long',
              day: 'numeric',
            }).format(new Date())}
          </p>
        </section>

        <section className="recipe-history">
          <div className="recipe-history-heading">
            <h2>Recently viewed</h2>
            {recipeHistory.length > 0 && (
              <button onClick={clearRecipeHistory} type="button">
                Clear history
              </button>
            )}
          </div>

          {recipeHistory.length === 0 && (
            <p className="empty-history">No recipes viewed yet.</p>
          )}

          <div className="history-list">
            {recipeHistory.slice(0, historyPreviewSize).map((item) => (
              <article className="history-item" key={item.idMeal}>
                <img src={item.strMealThumb} alt={item.strMeal} />
                <p>{item.strMeal}</p>
              </article>
            ))}
          </div>

          {recipeHistory.length > historyPreviewSize && (
            <button
              className="view-history-button"
              onClick={() => setIsHistoryOpen(true)}
              type="button"
            >
              View all history
            </button>
          )}
        </section>
      </aside>

      {isHistoryOpen && (
        <div className="history-modal-backdrop" role="presentation">
          <section
            aria-labelledby="history-title"
            aria-modal="true"
            className="history-modal"
            role="dialog"
          >
            <div className="history-modal-heading">
              <h2 id="history-title">All viewed recipes</h2>
              <button
                aria-label="Close recipe history"
                onClick={() => setIsHistoryOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="history-modal-list">
              {recipeHistory.map((item) => (
                <article className="history-item" key={item.idMeal}>
                  <img src={item.strMealThumb} alt={item.strMeal} />
                  <p>{item.strMeal}</p>
                </article>
              ))}
            </div>

            <button
              className="clear-history-button"
              onClick={clearRecipeHistory}
              type="button"
            >
              Clear history
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
