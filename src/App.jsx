import { useState } from 'react'
import './App.css'

export default function App() {
  const [recipe, setRecipe] = useState(null)
  async function getRandomRecipe() {
    const response = await fetch(
      'https://www.themealdb.com/api/json/v1/1/random.php'
    )

    const data = await response.json()
    setRecipe(data.meals[0])
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
        <label className="search">
          <input placeholder="Search recipes or ingredients" />
        </label>

        <section className="recipe-day">
          <div className="recipe-day-content">
            <h2>Recipe of the day</h2>
            <p>Find something tasty today.</p>
            <button className="button" onClick={getRandomRecipe}>
              Get random recipe
            </button>
            {recipe && <h3>{recipe.strMeal}</h3>}
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

          <div className="recipe-list">
            <article className="recipe-card">
              <div className="card-image">🍗</div>
                <h3>Chicken</h3>
            </article>

            <article className="recipe-card">
              <div className="card-image">🍝</div>
                <h3>Pasta</h3>
            </article>

            <article className="recipe-card">
              <div className="card-image">🍲</div>
              <h3>Soup</h3>
            </article>

            <article className="recipe-card">
              <div className="card-image">🥗</div>
              <h3>Vegetables</h3>
            </article>
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