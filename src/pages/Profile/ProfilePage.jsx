import { useState } from 'react'
import { EditPencil, Eye, Heart, PageEdit, Plus, Search, Trash, User, Xmark } from 'iconoir-react'
import ProductIcon from '../MyFridge/ProductIcon'
import { productOptions } from '../MyFridge/productOptions'

const cuisineOptions = ['Italian', 'Asian', 'American', 'European', 'Indian', 'MiddleEastern', 'Caribbean']
const dietaryOptions = ['Vegetarian', 'Vegan', 'No dairy', 'No gluten', 'Low sugar', 'High protein']
const cookingLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const weeklyGoals = ['Every day', 'Once a week', 'Twice a week', '3 times a week', '4 times a week', '5 times a week', 'Rarely']

function Modal({ children, onClose, title }) {
  return <div className="profile-modal-backdrop"><section className="profile-modal" role="dialog"><button aria-label="Close" className="profile-modal-close" onClick={onClose} type="button"><Xmark /></button><h2>{title}</h2>{children}</section></div>
}

function PreferenceGroup({ title, items }) {
  return <section className="preference-group"><h3>{title}</h3><div>{items.map((item) => <span key={item}>{item}</span>)}</div></section>
}

function FormActions({ onCancel, onSave, saveText = 'Save changes' }) {
  return <div className="modal-actions"><button onClick={onCancel} type="button">Cancel</button><button onClick={onSave} type="button">{saveText}</button></div>
}

function NotesContent({ notes }) {
  if (notes) {
    return <p className="saved-notes">{notes}</p>
  }

  return <div className="notes-lines"><span /><span /><span /><span /><span /></div>
}

function HistoryContent({ recipeHistory, onOpenRecipe, onRemoveRecipeFromHistory }) {
  if (recipeHistory.length === 0) {
    return <p>No recipes viewed yet.</p>
  }

  return recipeHistory.map((recipe) => (
    <article key={recipe.idMeal}>
      <button onClick={() => onOpenRecipe(recipe)} type="button">
        <img alt={recipe.strMeal} src={recipe.strMealThumb} />
        <span>{recipe.strMeal}</span>
      </button>
      <button aria-label={`Remove ${recipe.strMeal}`} onClick={() => onRemoveRecipeFromHistory(recipe.idMeal)} type="button">
        <Trash />
      </button>
    </article>
  ))
}

export default function ProfilePage(props) {
  const { favoriteCount, onClearRecipeHistory, onOpenFavorites, onOpenRecipe, onProfileChange, onRemoveRecipeFromHistory, profile, recipeHistory, viewedRecipeCount } = props
  const [openModal, setOpenModal] = useState('')
  const [profileDraft, setProfileDraft] = useState(profile)
  const [preferencesDraft, setPreferencesDraft] = useState(profile)
  const [notesDraft, setNotesDraft] = useState(profile.notes)
  const [ingredientsDraft, setIngredientsDraft] = useState(profile.dislikedIngredients)
  const [ingredientSearchText, setIngredientSearchText] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const personalInformation = [['Full name', profile.fullName], ['Email address', profile.email], ['Location', profile.location], ['Member since', profile.memberSince], ['Cooking level', profile.cookingLevel], ['Weekly goal', profile.weeklyGoal]]
  const visibleProducts = productOptions.filter((product) => product.name.toLowerCase().includes(ingredientSearchText.toLowerCase()))

  function closeModal() { setOpenModal('') }
  function openProfileEditor() { setProfileDraft(profile); setOpenModal('profile') }
  function openPreferencesEditor() { setPreferencesDraft(profile); setOpenModal('preferences') }
  function openNotesEditor() { setNotesDraft(profile.notes); setOpenModal('notes') }
  function saveProfile() { onProfileChange({ ...profile, ...profileDraft }); closeModal() }
  function savePreferences() { onProfileChange({ ...profile, ...preferencesDraft }); closeModal() }
  function saveNotes() { onProfileChange({ ...profile, notes: notesDraft }); closeModal() }

  function toggleListItem(fieldName, item) {
    const currentItems = preferencesDraft[fieldName]
    let updatedItems

    if (currentItems.includes(item)) {
      updatedItems = currentItems.filter((currentItem) => currentItem !== item)
    } else {
      updatedItems = [...currentItems, item]
    }

    setPreferencesDraft({ ...preferencesDraft, [fieldName]: updatedItems })
  }

  function toggleIngredient(productName) {
    let updatedIngredients

    if (ingredientsDraft.includes(productName)) {
      updatedIngredients = ingredientsDraft.filter((ingredient) => ingredient !== productName)
    } else {
      updatedIngredients = [...ingredientsDraft, productName]
    }

    setIngredientsDraft(updatedIngredients)
  }

  function getChoiceButtonClass(selectedItems, item) {
    if (selectedItems.includes(item)) {
      return 'selected-choice'
    }

    return ''
  }

  function getIngredientButtonClass(productName) {
    if (ingredientsDraft.includes(productName)) {
      return 'selected-ingredient'
    }

    return ''
  }

  function saveIngredients() {
    setPreferencesDraft({ ...preferencesDraft, dislikedIngredients: ingredientsDraft })
    setOpenModal('preferences')
  }

  return (
    <main className="profile-page">
      <section className="profile-summary">
        <div className="profile-heading">
          <span className="profile-avatar"><User /></span>
          <h1>{profile.fullName}</h1>
        </div>
        <div className="profile-stats">
          <article><PageEdit /><strong>0</strong><span>Recipes created</span></article>
          <button onClick={onOpenFavorites} type="button"><Heart /><strong>{favoriteCount}</strong><span>Favorite recipes</span></button>
          <button onClick={() => setIsHistoryOpen(true)} type="button"><Eye /><strong>{viewedRecipeCount}</strong><span>Recipes viewed</span></button>
        </div>
      </section>

      <section className="profile-panel personal-information">
        <header><h2>Personal information</h2><button onClick={openProfileEditor} type="button"><EditPencil /> Edit profile</button></header>
        <div className="personal-information-grid">
          {personalInformation.map(([label, value]) => (
            <div className="personal-information-item" key={label}>
              <span />
              <p>{label}<strong>{value}</strong></p>
            </div>
          ))}
        </div>
      </section>

      <div className="profile-bottom-grid">
        <section className="profile-panel preferences-panel">
          <header><h2>Your preferences</h2><button onClick={openPreferencesEditor} type="button">Edit</button></header>
          <PreferenceGroup items={profile.favoriteCuisines} title="Favorite cuisines" />
          <PreferenceGroup items={profile.dietaryPreferences} title="Dietary preferences" />
          <PreferenceGroup items={profile.dislikedIngredients} title="Disliked ingredients" />
        </section>
        <section className="profile-panel notes-panel">
          <header><h2>Notes</h2><button onClick={openNotesEditor} type="button">Edit</button></header>
          <NotesContent notes={profile.notes} />
        </section>
      </div>

    {openModal === 'profile' && (
      <Modal onClose={closeModal} title="Edit profile">
        <p>Update your personal information</p>
        <div className="profile-form-grid">
          <label>Full name<input onChange={(event) => setProfileDraft({ ...profileDraft, fullName: event.target.value })} value={profileDraft.fullName} /></label>
          <label>Email address<input onChange={(event) => setProfileDraft({ ...profileDraft, email: event.target.value })} value={profileDraft.email} /></label>
          <label>Location<input onChange={(event) => setProfileDraft({ ...profileDraft, location: event.target.value })} value={profileDraft.location} /></label>
          <label>Member since<input disabled value={profileDraft.memberSince} /></label>
          <label>Cooking level<select onChange={(event) => setProfileDraft({ ...profileDraft, cookingLevel: event.target.value })} value={profileDraft.cookingLevel}><option value="">Not selected</option>{cookingLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Weekly goal<select onChange={(event) => setProfileDraft({ ...profileDraft, weeklyGoal: event.target.value })} value={profileDraft.weeklyGoal}><option value="">Not selected</option>{weeklyGoals.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <FormActions onCancel={closeModal} onSave={saveProfile} />
      </Modal>
    )}

      {openModal === 'preferences' && (
        <Modal onClose={closeModal} title="Edit preferences">
          <p>Choose your preferences to get more personalized recipes</p>
          <h3>Favorite cuisines</h3>
          <div className="choice-list">
            {cuisineOptions.map((item) => <button className={getChoiceButtonClass(preferencesDraft.favoriteCuisines, item)} key={item} onClick={() => toggleListItem('favoriteCuisines', item)} type="button">{item}</button>)}
          </div>
          <h3>Dietary preferences</h3>
          <div className="choice-list">
            {dietaryOptions.map((item) => <button className={getChoiceButtonClass(preferencesDraft.dietaryPreferences, item)} key={item} onClick={() => toggleListItem('dietaryPreferences', item)} type="button">{item}</button>)}
          </div>
          <h3>Disliked ingredients</h3>
          <div className="choice-list">
            {preferencesDraft.dislikedIngredients.map((item) => <span key={item}>{item}</span>)}
            <button className="add-more-button" onClick={() => { setIngredientsDraft(preferencesDraft.dislikedIngredients); setOpenModal('ingredients') }} type="button"><Plus /> Add more</button>
          </div>
          <FormActions onCancel={closeModal} onSave={savePreferences} />
        </Modal>
      )}

      {openModal === 'ingredients' && (
        <Modal onClose={() => setOpenModal('preferences')} title="Add more ingredients">
          <p>Choose ingredients you would like to include in your preferences</p>
          <label className="ingredient-search">
            <Search />
            <input
              onChange={(event) => setIngredientSearchText(event.target.value)}
              placeholder="Search ingredients..."
              value={ingredientSearchText}
            />
          </label>
          <div className="ingredient-options">
            {visibleProducts.map((product) => (
              <button
                className={getIngredientButtonClass(product.name)}
                key={product.name}
                onClick={() => toggleIngredient(product.name)}
                type="button"
              >
                <ProductIcon product={product} />
                <span>{product.name}</span>
              </button>
            ))}
          </div>
          <FormActions
            onCancel={() => setOpenModal('preferences')}
            onSave={saveIngredients}
            saveText="Add to preferences"
          />
        </Modal>
      )}

      {openModal === 'notes' && (
        <Modal onClose={closeModal} title="Notes">
          <p>Add any notes, preferences or cooking tips</p>
          <textarea
            maxLength="1000"
            onChange={(event) => setNotesDraft(event.target.value)}
            value={notesDraft}
          />
          <p className="notes-character-count">{notesDraft.length} / 1000 characters</p>
          <FormActions onCancel={closeModal} onSave={saveNotes} />
        </Modal>
      )}

      {isHistoryOpen && (
        <Modal onClose={() => setIsHistoryOpen(false)} title="Recently viewed recipes">
          <div className="profile-history-list">
            <HistoryContent
              recipeHistory={recipeHistory}
              onOpenRecipe={onOpenRecipe}
              onRemoveRecipeFromHistory={onRemoveRecipeFromHistory}
            />
          </div>
          {recipeHistory.length > 0 && (
            <button className="clear-profile-history" onClick={onClearRecipeHistory} type="button">
              Clear history
            </button>
          )}
        </Modal>
      )}
    </main>
  )
}
