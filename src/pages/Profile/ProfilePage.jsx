import { EditPencil, Eye, Heart, PageEdit, User } from 'iconoir-react'

const personalInformation = [
  ['Full name', 'User Name'],
  ['Email address', 'user_name@gmail.com'],
  ['Location', 'Latvia, Riga'],
  ['Member since', 'May 2025'],
  ['Cooking level', 'Beginner'],
  ['Weekly goal', '5 times a week'],
]

function PreferenceGroup({ title, items }) {
  return (
    <section className="preference-group">
      <h3>{title}</h3>
      <div>
        {items.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  )
}

export default function ProfilePage({ favoriteCount, viewedRecipeCount }) {
  return (
    <main className="profile-page">
      <section className="profile-summary">
        <div className="profile-heading">
          <span className="profile-avatar"><User aria-hidden="true" /></span>
          <h1>User Name</h1>
        </div>

        <div className="profile-stats">
          <article><PageEdit aria-hidden="true" /><strong>0</strong><span>Recipes created</span></article>
          <article><Heart aria-hidden="true" /><strong>{favoriteCount}</strong><span>Favorite recipes</span></article>
          <article><Eye aria-hidden="true" /><strong>{viewedRecipeCount}</strong><span>Recipes viewed</span></article>
        </div>
      </section>

      <section className="profile-panel personal-information">
        <header>
          <h2>Personal information</h2>
          <button type="button"><EditPencil aria-hidden="true" /> Edit profile</button>
        </header>
        <div className="personal-information-grid">
          {personalInformation.map(([label, value]) => (
            <div className="personal-information-item" key={label}>
              <span aria-hidden="true" />
              <p>{label}<strong>{value}</strong></p>
            </div>
          ))}
        </div>
      </section>

      <div className="profile-bottom-grid">
        <section className="profile-panel preferences-panel">
          <header><h2>Your preferences</h2><button type="button">Edit</button></header>
          <PreferenceGroup title="Favorite cuisines" items={['Italian', 'Asian', 'American', 'European']} />
          <PreferenceGroup title="Dietary preferences" items={['No dairy', 'No gluten', 'Low sugar']} />
          <PreferenceGroup title="Disliked ingredients" items={['Mushrooms', 'Olives', 'Cilantro']} />
        </section>

        <section className="profile-panel notes-panel">
          <header><h2>Notes</h2><button type="button">Edit</button></header>
          <div className="notes-lines" aria-label="Notes area"><span /><span /><span /><span /><span /></div>
        </section>
      </div>
    </main>
  )
}
