import { useEffect, useState } from 'react'
import {
  getDailyRecipe,
  getRecipeById,
  getRecommendedRecipes,
  searchRecipes,
} from './api/meals'
import FavoritesPage from './pages/Favorites/FavoritesPage'
import FavoriteButton from './pages/Favorites/FavoriteButton'
import MyFridgePage from './pages/MyFridge/MyFridgePage'
import ProductIcon from './pages/MyFridge/ProductIcon'
import { fridgeStorageName, getSavedProducts } from './pages/MyFridge/fridgeStorage'
import ProfilePage from './pages/Profile/ProfilePage'
import { getSavedUserProfile, profileStorageName } from './pages/Profile/profileStorage'
import RecipesPage from './pages/Recipes/RecipesPage'
import RecipeCard from './components/RecipeCard'
import RecipeDetail from './components/RecipeDetail'
import Sidebar from './components/Sidebar'
import AuthPage from './pages/Auth/AuthPage'
import './App.css'

const storageName = 'cookit.daily-recipe'
const historyPreviewSize = 4

function favoritesStorageName(userId) {
  return `cookit.${userId}.favorite-recipes`
}

function historyStorageName(userId) {
  return `cookit.${userId}.recipe-history`
}

function recommendedRecipesStorageName(userId) {
  return `cookit.${userId}.recommended-recipes`
}

function getSavedFavoriteRecipes(userId) {
  try {
    const savedRecipes = JSON.parse(localStorage.getItem(favoritesStorageName(userId)))
    if (Array.isArray(savedRecipes)) {
      return savedRecipes
    }

    return []
  } catch {
    return []
  }
}

function getSavedRecommendedRecipes(userId) {
  try {
    const savedRecipes = JSON.parse(localStorage.getItem(recommendedRecipesStorageName(userId)))
    if (Array.isArray(savedRecipes)) {
      return savedRecipes
    }

    return []
  } catch {
    return []
  }
}

function getSavedRecipeHistory(userId) {
  try {
    const savedHistory = JSON.parse(localStorage.getItem(historyStorageName(userId)))

    if (Array.isArray(savedHistory)) {
      return savedHistory
    }

    return []
  } catch {
    localStorage.removeItem(historyStorageName(userId))
    return []
  }
}

function getRecipeDetails(recipe) {
  let ingredients = 0

  for (let number = 1; number <= 20; number += 1) {
    const ingredient = recipe[`strIngredient${number}`]

    if (ingredient && ingredient.trim()) {
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

function getRecipeDayContent(recipe, details) {
  const content = {
    category: 'Recipe',
    time: '—',
    difficulty: '—',
    description: 'Your recipe of the day is being prepared.',
  }

  if (recipe) {
    content.category = recipe.strCategory
    content.description = `A tasty ${recipe.strMeal} recipe for today.`
  }

  if (details) {
    content.time = `≈ ${details.estimatedMinutes} min`
    content.difficulty = details.difficulty
  }

  return content
}

function HomeFridgeProducts({ products }) {
  if (products.length === 0) {
    return <p className="home-fridge-empty">Your fridge is empty. Add products to find matching recipes.</p>
  }

  return products.map((product) => (
    <div className="ingredient" key={product.id}>
      <ProductIcon product={product} />
      <p>{product.name}</p>
    </div>
  ))
}

function CookItApp({ onLogOut, userId, userEmail }) {
  const [recipe, setRecipe] = useState(null)
  const [dailyRecipeStatus, setDailyRecipeStatus] = useState('loading')
  const [searchText, setSearchText] = useState('')
  const [searchRecipesList, setSearchRecipesList] = useState([])
  const [recommendedRecipes, setRecommendedRecipes] = useState(() => getSavedRecommendedRecipes(userId))
  const [recipeHistory, setRecipeHistory] = useState(() => getSavedRecipeHistory(userId))
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [openedRecipe, setOpenedRecipe] = useState(null)
  const [openedRecipeStatus, setOpenedRecipeStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [page, setPage] = useState('home')
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [fridgeProducts, setFridgeProducts] = useState(() => getSavedProducts(userId))
  const [favoriteRecipes, setFavoriteRecipes] = useState(() => getSavedFavoriteRecipes(userId))
  const [userProfile, setUserProfile] = useState(() => getSavedUserProfile(userId, userEmail))

  function updateFridgeProducts(products) {
    setFridgeProducts(products)
    localStorage.setItem(fridgeStorageName(userId), JSON.stringify(products))
  }

  function isFavoriteRecipe(recipe) {
    return favoriteRecipes.some((favoriteRecipe) => favoriteRecipe.idMeal === recipe.idMeal)
  }

  function toggleFavoriteRecipe(recipe) {
    const recipeIsFavorite = isFavoriteRecipe(recipe)
    let updatedFavoriteRecipes

    if (recipeIsFavorite) {
      updatedFavoriteRecipes = favoriteRecipes.filter((favoriteRecipe) => favoriteRecipe.idMeal !== recipe.idMeal)
    } else {
      updatedFavoriteRecipes = [recipe, ...favoriteRecipes]
    }

    setFavoriteRecipes(updatedFavoriteRecipes)
    localStorage.setItem(favoritesStorageName(userId), JSON.stringify(updatedFavoriteRecipes))
  }

  function updateUserProfile(updatedProfile) {
    setUserProfile(updatedProfile)
    localStorage.setItem(profileStorageName(userId), JSON.stringify(updatedProfile))
  }

  useEffect(() => {
    function showPreviousPage() {
      const path = window.location.pathname
      setCurrentPath(path)

      if (path === '/recommended') {
        setPage('recommended')
        return
      }

      if (path === '/search') {
        setPage('search')
        return
      }

      setPage('home')
    }

    window.addEventListener('popstate', showPreviousPage)
    return () => window.removeEventListener('popstate', showPreviousPage)
  }, [])

  useEffect(() => {
    let pageIsOpen = true

    async function loadRecommendedRecipes() {
      try {
        const recipes = await getRecommendedRecipes(userProfile.favoriteCuisines)
        if (pageIsOpen) {
          setRecommendedRecipes(recipes)
          localStorage.setItem(recommendedRecipesStorageName(userId), JSON.stringify(recipes))
        }
      } catch {
        return
      }
    }

    loadRecommendedRecipes()
    return () => { pageIsOpen = false }
  }, [userId, userProfile.favoriteCuisines])

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

      if (savedRecipe && savedRecipe.date === today && savedRecipe.recipe) {
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
    localStorage.setItem(historyStorageName(userId), JSON.stringify(updatedHistory))
  }

  function clearRecipeHistory() {
    setRecipeHistory([])
    localStorage.removeItem(historyStorageName(userId))
    setIsHistoryOpen(false)
  }

  function removeRecipeFromHistory(recipeId) {
    const updatedHistory = recipeHistory.filter((recipe) => recipe.idMeal !== recipeId)
    setRecipeHistory(updatedHistory)
    localStorage.setItem(historyStorageName(userId), JSON.stringify(updatedHistory))
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
      window.history.pushState({}, '', '/search')
      setCurrentPath('/search')
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

  function showAllRecipes() {
    window.history.pushState({}, '', '/recommended')
    setCurrentPath('/recommended')
    setPage('recommended')
    setMessage('')
  }

  function goToPage(path) {
    if (path === currentPath) {
      return
    }

    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  let recipeDetails = null

  if (recipe) {
    recipeDetails = getRecipeDetails(recipe)
  }
  const recipeDayContent = getRecipeDayContent(recipe, recipeDetails)
  if (currentPath === '/my-fridge') {
    return (
      <div className="page demo-layout">
        <Sidebar currentPath={currentPath} goToPage={goToPage} onLogOut={onLogOut} userName={userProfile.fullName} />
        <MyFridgePage products={fridgeProducts} onProductsChange={updateFridgeProducts} />
      </div>
    )
  }

  if (currentPath === '/recipes') {
    return (
      <div className="page demo-layout">
        <Sidebar currentPath={currentPath} goToPage={goToPage} onLogOut={onLogOut} userName={userProfile.fullName} />
        <RecipesPage
          onOpenRecipe={openRecipe}
          isFavorite={isFavoriteRecipe}
          onToggleFavorite={toggleFavoriteRecipe}
          products={fridgeProducts}
          userId={userId}
          onEditIngredients={() => goToPage('/my-fridge')}
        />
        <RecipeDetail recipe={openedRecipe} status={openedRecipeStatus} onClose={closeRecipe} isFavorite={isFavoriteRecipe} onToggleFavorite={toggleFavoriteRecipe} />
      </div>
    )
  }

  if (currentPath === '/favorites') {
    return (
      <div className="page demo-layout">
        <Sidebar currentPath={currentPath} goToPage={goToPage} onLogOut={onLogOut} userName={userProfile.fullName} />
        <FavoritesPage
          favoriteRecipes={favoriteRecipes}
          isFavorite={isFavoriteRecipe}
          onOpenRecipe={openRecipe}
          onToggleFavorite={toggleFavoriteRecipe}
        />
        <RecipeDetail recipe={openedRecipe} status={openedRecipeStatus} onClose={closeRecipe} isFavorite={isFavoriteRecipe} onToggleFavorite={toggleFavoriteRecipe} />
      </div>
    )
  }

  if (currentPath === '/profile') {
    return (
      <div className="page demo-layout">
        <Sidebar currentPath={currentPath} goToPage={goToPage} onLogOut={onLogOut} userName={userProfile.fullName} />
        <ProfilePage
          favoriteCount={favoriteRecipes.length}
          onOpenFavorites={() => goToPage('/favorites')}
          onOpenRecipe={openRecipe}
          onRemoveRecipeFromHistory={removeRecipeFromHistory}
          profile={userProfile}
          recipeHistory={recipeHistory}
          onProfileChange={updateUserProfile}
          onClearRecipeHistory={clearRecipeHistory}
          viewedRecipeCount={recipeHistory.length}
        />
        <RecipeDetail recipe={openedRecipe} status={openedRecipeStatus} onClose={closeRecipe} isFavorite={isFavoriteRecipe} onToggleFavorite={toggleFavoriteRecipe} />
      </div>
    )
  }

  if (page === 'search') {
    return (
      <>
        <main className="result-page">
        <h1>Search results</h1>
        <p className="search-title">You searched for: {searchText}</p>

        {message && <p>{message}</p>}

        <div className="result-list">
          {searchRecipesList.map((item) => (
            <RecipeCard
              isFavorite={isFavoriteRecipe}
              key={item.idMeal}
              onOpenRecipe={openRecipe}
              onToggleFavorite={toggleFavoriteRecipe}
              recipe={item}
            />
          ))}
        </div>
        </main>
        <RecipeDetail recipe={openedRecipe} status={openedRecipeStatus} onClose={closeRecipe} isFavorite={isFavoriteRecipe} onToggleFavorite={toggleFavoriteRecipe} />
      </>
    )
  }

  if (page === 'recommended') {
    return (
      <>
        <main className="result-page">
        <h1>Recommended recipes</h1>
        <p className="search-title">More recipes for today</p>

        {message && <p>{message}</p>}

        <div className="result-list">
          {recommendedRecipes.map((item) => (
            <RecipeCard
              isFavorite={isFavoriteRecipe}
              key={item.idMeal}
              onOpenRecipe={openRecipe}
              onToggleFavorite={toggleFavoriteRecipe}
              recipe={item}
            />
          ))}
        </div>
        </main>
        <RecipeDetail recipe={openedRecipe} status={openedRecipeStatus} onClose={closeRecipe} isFavorite={isFavoriteRecipe} onToggleFavorite={toggleFavoriteRecipe} />
      </>
    )
  }

  return (
    <div className="page">
      <Sidebar currentPath={currentPath} goToPage={goToPage} onLogOut={onLogOut} userName={userProfile.fullName} />

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
              <span>{recipeDayContent.category}</span>
              <span>{recipeDayContent.time}</span>
              <span>{recipeDayContent.difficulty}</span>
            </div>

            <h2>
              Recipe of
              <br />
              the day
            </h2>

            <p className="recipe-day-description">{recipeDayContent.description}</p>

            <button
              className="recipe-info-button"
              disabled={!recipe}
              onClick={() => openRecipe(recipe)}
              type="button"
            >
              View recipe <span aria-hidden="true">→</span>
            </button>

            {recipe && (
              <FavoriteButton
                isFavorite={isFavoriteRecipe(recipe)}
                onClick={() => toggleFavoriteRecipe(recipe)}
                recipeName={recipe.strMeal}
              />
            )}

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
            <HomeFridgeProducts products={fridgeProducts} />
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
              <RecipeCard
                isFavorite={isFavoriteRecipe}
                key={item.idMeal}
                onOpenRecipe={openRecipe}
                onToggleFavorite={toggleFavoriteRecipe}
                recipe={item}
              />
            ))}

            {recommendedRecipes.length > 0 && (
              <button className="view-all" onClick={showAllRecipes} type="button">
                <span>•••</span>
                View all
              </button>
            )}
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

      <RecipeDetail recipe={openedRecipe} status={openedRecipeStatus} onClose={closeRecipe} isFavorite={isFavoriteRecipe} onToggleFavorite={toggleFavoriteRecipe} />
    </div>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('cookit.token')))
  const [userId, setUserId] = useState(() => localStorage.getItem('cookit.user-id'))
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('cookit.user-email') || '')

  function logOut() {
    localStorage.removeItem('cookit.token')
    localStorage.removeItem('cookit.user-id')
    localStorage.removeItem('cookit.user-email')
    setIsLoggedIn(false)
  }

  function logIn(userId, email) {
    setUserId(String(userId))
    setUserEmail(email)
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return <AuthPage onLoggedIn={logIn} />
  }

  return <CookItApp key={userId} onLogOut={logOut} userEmail={userEmail} userId={userId} />
}
