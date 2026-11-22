import { Book, Fridge, Heart, HomeAlt, User } from 'iconoir-react'

const menuItems = [
  { path: '/', label: 'Home', icon: HomeAlt },
  { path: '/my-fridge', label: 'My Fridge', icon: Fridge },
  { path: '/recipes', label: 'Recipes', icon: Book },
  { path: '/favorites', label: 'Favorites', icon: Heart },
  { path: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar({ currentPath, goToPage, userName }) {
  return (
    <aside className="sidebar">
      <h1>CookIt</h1>
      <nav className="main-menu" aria-label="Main navigation">
        {menuItems.map((item) => {
          const Icon = item.icon
          let className = 'menu-link'

          if (currentPath === item.path) {
            className = 'menu-link active-menu-link'
          }

          return (
            <button className={className} key={item.path} onClick={() => goToPage(item.path)} type="button">
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <p className="user-name">{userName}</p>
    </aside>
  )
}
