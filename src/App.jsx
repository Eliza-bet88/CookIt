import { useEffect, useState } from 'react'
import { Book, Fridge, Heart, HomeAlt, User } from 'iconoir-react'
import {
  getDailyRecipe,
  getRecipeById,
  getRecommendedRecipes,
  searchRecipes,
} from './api/meals'
import FavoritesPage from './pages/Favorites/FavoritesPage'
import MyFridgePage from './pages/MyFridge/MyFridgePage'
import ProductIcon from './pages/MyFridge/ProductIcon'
import { fridgeStorageName, getSavedProducts } from './pages/MyFridge/fridgeStorage'
import ProfilePage from './pages/Profile/ProfilePage'
import RecipesPage from './pages/Recipes/RecipesPage'
import './App.css'

const storageName = 'cookit.daily-recipe'
const historyStorageName = 'cookit.recipe-history'
const historyPreviewSize = 4

const menuItems = [
  { path: '/', label: 'Home', icon: HomeAlt },
  { path: '/my-fridge', label: 'My Fridge', icon: Fridge },
  { path: '/recipes', label: 'Recipes', icon: Book },
  { path: '/favorites', label: 'Favorites', icon: Heart },
  { path: '/profile', label: 'Profile', icon: User },
]

const demoPages = {
  '/favorites': FavoritesPage,
  '/profile': ProfilePage,
}

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

function getIngredients(recipe) {
  const ingredients = []

  for (let number = 1; number <= 20; number += 1) {
    const name = recipe[`strIngredient${number}`]?.trim()
    const measure = recipe[`strMeasure${number}`]?.trim()

    if (name) {
      ingredients.push(measure ? `${measure} ${name}` : name)
    }
  }

  return ingredients
}

function getVideoEmbedUrl(videoUrl) {
  if (!videoUrl) {
    return ''
  }

  try {
    const url = new URL(videoUrl)
    const videoId = url.hostname.includes('youtu.be')
      ? url.pathname.slice(1)
      : url.searchParams.get('v')

    return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
  } catch {
    return ''
  }
}

function RecipeDialog({ recipe, status, onClose }) {
  if (!recipe && status !== 'loading') {
    return null
  }

  const videoEmbedUrl = recipe ? getVideoEmbedUrl(recipe.strYoutube) : ''

  return (
    <div className="recipe-dialog-backdrop" role="presentation">
      <section
        aria-labelledby="recipe-dialog-title"
        aria-modal="true"
        className="recipe-dialog"
        role="dialog"
      >
        <button
          aria-label="Close recipe"
          className="close-dialog-button"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        {status === 'loading' && <p className="dialog-message">Loading recipe...</p>}
        {status === 'error' && <p className="dialog-message">Could not load this recipe.</p>}

        {recipe && status === 'ready' && (
          <>
            <img className="recipe-dialog-image" src={recipe.strMealThumb} alt={recipe.strMeal} />
            <div className="recipe-dialog-content">
              <p className="recipe-dialog-category">{recipe.strCategory} · {recipe.strArea}</p>
              <h2 id="recipe-dialog-title">{recipe.strMeal}</h2>
              <h3>Ingredients</h3>
              <ul className="ingredient-list">
                {getIngredients(recipe).map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
              </ul>
              <h3>Instructions</h3>
              <p className="recipe-instructions">{recipe.strInstructions}</p>
              {videoEmbedUrl && (
                <div className="recipe-video">
                  <iframe
                    allowFullScreen
                    src={videoEmbedUrl}
                    title={`${recipe.strMeal} video`}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function Sidebar({ currentPath, goToPage }) {
  return (
    <aside className="sidebar">
      <h1>CookIt</h1>
      <nav className="main-menu" aria-label="Main navigation">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path

          return (
            <button
              className={isActive ? 'menu-link active-menu-link' : 'menu-link'}
              key={item.path}
              onClick={() => goToPage(item.path)}
              type="button"
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <p className="user-name">User Name</p>
    </aside>
  )
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
  const [openedRecipe, setOpenedRecipe] = useState(null)
  const [openedRecipeStatus, setOpenedRecipeStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [page, setPage] = useState('home')
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [fridgeProducts, setFridgeProducts] = useState(getSavedProducts)

  function updateFridgeProducts(products) {
    setFridgeProducts(products)
    localStorage.setItem(fridgeStorageName, JSON.stringify(products))
  }

  useEffect(() => {
    function showPreviousPage() {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', showPreviousPage)
    return () => window.removeEventListener('popstate', showPreviousPage)
  }, [])

  useEffect(() => {
    let pageIsOpen = true

    async function loadRecommendedRecipes() {
      try {
        const recipes = await getRecommendedRecipes()
        if (pageIsOpen) setRecommendedRecipes(recipes)
      } catch {
        if (pageIsOpen) setRecommendedRecipes([])
      }
    }

    loadRecommendedRecipes()
    return () => { pageIsOpen = false }
  }, [])

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

  async function openRecipe(recipeToOpen) {
    if (!recipeToOpen) {
      return
    }

    setOpenedRecipe(null)
    setOpenedRecipeStatus('loading')
    setIsHistoryOpen(false)

    try {
      const fullRecipe = await getRecipeById(recipeToOpen.idMeal)
      setOpenedRecipe(fullRecipe)
      setOpenedRecipeStatus('ready')
      saveRecipeToHistory(fullRecipe)
    } catch {
      setOpenedRecipeStatus('error')
    }
  }

  function closeRecipe() {
    setOpenedRecipe(null)
    setOpenedRecipeStatus('idle')
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

  function goToPage(path) {
    if (path === currentPath) {
      return
    }

    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  const recipeDetails = recipe ? getRecipeDetails(recipe) : null
  if (currentPath === '/my-fridge') {
    return (
      <div className="page demo-layout">
        <Sidebar currentPath={currentPath} goToPage={goToPage} />
        <MyFridgePage products={fridgeProducts} onProductsChange={updateFridgeProducts} />
      </div>
    )
  }

  if (currentPath === '/recipes') {
    return (
      <div className="page demo-layout">
        <Sidebar currentPath={currentPath} goToPage={goToPage} />
        <RecipesPage
          products={fridgeProducts}
          onEditIngredients={() => goToPage('/my-fridge')}
        />
      </div>
    )
  }

  const DemoPage = demoPages[currentPath]

  if (DemoPage) {
    return (
      <div className="page demo-layout">
        <Sidebar currentPath={currentPath} goToPage={goToPage} />
        <DemoPage />
      </div>
    )
  }

  if (page === 'search') {
    return (
      <>
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
              onClick={() => openRecipe(item)}
              type="button"
            >
              <img src={item.strMealThumb} alt={item.strMeal} />
              <h3>{item.strMeal}</h3>
            </button>
          ))}
        </div>
        </main>
        <RecipeDialog recipe={openedRecipe} status={openedRecipeStatus} onClose={closeRecipe} />
      </>
    )
  }

  if (page === 'recommended') {
    return (
      <>
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
              onClick={() => openRecipe(item)}
              type="button"
            >
              <img src={item.strMealThumb} alt={item.strMeal} />
              <h3>{item.strMeal}</h3>
            </button>
          ))}
        </div>
        </main>
        <RecipeDialog recipe={openedRecipe} status={openedRecipeStatus} onClose={closeRecipe} />
      </>
    )
  }

  return (
    <div className="page">
      <Sidebar currentPath={currentPath} goToPage={goToPage} />

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
              onClick={() => openRecipe(recipe)}
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
            {fridgeProducts.length > 0 ? fridgeProducts.map((product) => (
              <div className="ingredient" key={product.id}>
                <ProductIcon product={product} />
                <p>{product.name}</p>
              </div>
            )) : <p className="home-fridge-empty">Your fridge is empty. Add products to find matching recipes.</p>}
          </div>

          <button className="button" onClick={() => goToPage('/recipes')} type="button">
            Find a recipe
          </button>
        </section>

        <section className="recipes" id="recipes">
          <h2>Recommended today</h2>

          {message && <p>{message}</p>}

          <div className="recipe-list">
            {recommendedRecipes.slice(0, 4).map((item) => (
              <button
                className="recipe-card"
                key={item.idMeal}
                onClick={() => openRecipe(item)}
                type="button">
                <img src={item.strMealThumb} alt={item.strMeal} />
                <h3>{item.strMeal}</h3>
              </button>
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
              <button
                className="history-item"
                key={item.idMeal}
                onClick={() => openRecipe(item)}
                type="button"
              >
                <img src={item.strMealThumb} alt={item.strMeal} />
                <p>{item.strMeal}</p>
                <span aria-hidden="true">›</span>
              </button>
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
                <button
                  className="history-item"
                  key={item.idMeal}
                  onClick={() => openRecipe(item)}
                  type="button"
                >
                  <img src={item.strMealThumb} alt={item.strMeal} />
                  <p>{item.strMeal}</p>
                  <span aria-hidden="true">›</span>
                </button>
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

      <RecipeDialog recipe={openedRecipe} status={openedRecipeStatus} onClose={closeRecipe} />
    </div>
  )
}
