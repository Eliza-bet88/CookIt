import './App.css'

export default function App() {
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
            <a className="button" href="#recipes">Open recipe</a>
          </div>
          <div className="recipe-day-image">demo image</div>
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

      </main>

      <aside className="right-panel">
        <h2>demo - today's day of the week</h2>
        <p>demo - today's date</p>
      </aside>
    </div>
  )
}