import { useState } from 'react'
import { EditPencil, Eye, Heart, PageEdit, Plus, Search, User, Xmark } from 'iconoir-react'
import ProductIcon from '../MyFridge/ProductIcon'
import { productOptions } from '../MyFridge/productOptions'

const cuisineOptions = ['Italian', 'Asian', 'American', 'European']
const dietaryOptions = ['No dairy', 'No gluten', 'Low sugar']

function PreferenceGroup({ title, items }) {
  return <section className="preference-group"><h3>{title}</h3><div>{items.map((item) => <span key={item}>{item}</span>)}</div></section>
}

function Modal({ children, onClose, title }) {
  return <div className="profile-modal-backdrop" role="presentation"><section aria-modal="true" className="profile-modal" role="dialog"><button aria-label="Close" className="profile-modal-close" onClick={onClose} type="button"><Xmark /></button><h2>{title}</h2>{children}</section></div>
}

export default function ProfilePage({ favoriteCount, onOpenFavorites, profile, onProfileChange, viewedRecipeCount }) {
  const [modal, setModal] = useState('')
  const [profileDraft, setProfileDraft] = useState(profile)
  const [preferencesDraft, setPreferencesDraft] = useState(profile)
  const [notesDraft, setNotesDraft] = useState(profile.notes)
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [ingredientsDraft, setIngredientsDraft] = useState(profile.dislikedIngredients)

  function openProfileEditor() { setProfileDraft(profile); setModal('profile') }
  function openPreferencesEditor() { setPreferencesDraft(profile); setModal('preferences') }
  function openNotesEditor() { setNotesDraft(profile.notes); setModal('notes') }
  function closeModal() { setModal('') }
  function saveProfile() { onProfileChange({ ...profile, ...profileDraft }); closeModal() }
  function savePreferences() { onProfileChange({ ...profile, ...preferencesDraft }); closeModal() }
  function saveNotes() { onProfileChange({ ...profile, notes: notesDraft }); closeModal() }

  function togglePreference(group, item) {
    const selectedItems = preferencesDraft[group]
    const updatedItems = selectedItems.includes(item)
      ? selectedItems.filter((selectedItem) => selectedItem !== item)
      : [...selectedItems, item]
    setPreferencesDraft({ ...preferencesDraft, [group]: updatedItems })
  }

  function toggleIngredient(productName) {
    const updatedIngredients = ingredientsDraft.includes(productName)
      ? ingredientsDraft.filter((ingredient) => ingredient !== productName)
      : [...ingredientsDraft, productName]
    setIngredientsDraft(updatedIngredients)
  }

  function saveIngredients() {
    setPreferencesDraft({ ...preferencesDraft, dislikedIngredients: ingredientsDraft })
    setModal('preferences')
  }

  const personalInformation = [
    ['Full name', profile.fullName], ['Email address', profile.email], ['Location', profile.location],
    ['Member since', profile.memberSince], ['Cooking level', profile.cookingLevel], ['Weekly goal', profile.weeklyGoal],
  ]
  const visibleProducts = productOptions.filter((product) => product.name.toLowerCase().includes(ingredientSearch.toLowerCase()))

  return <main className="profile-page">
    <section className="profile-summary"><div className="profile-heading"><span className="profile-avatar"><User /></span><h1>{profile.fullName}</h1></div><div className="profile-stats"><article><PageEdit /><strong>0</strong><span>Recipes created</span></article><button aria-label="Open favorite recipes" onClick={onOpenFavorites} type="button"><Heart /><strong>{favoriteCount}</strong><span>Favorite recipes</span></button><article><Eye /><strong>{viewedRecipeCount}</strong><span>Recipes viewed</span></article></div></section>

    <section className="profile-panel personal-information"><header><h2>Personal information</h2><button onClick={openProfileEditor} type="button"><EditPencil /> Edit profile</button></header><div className="personal-information-grid">{personalInformation.map(([label, value]) => <div className="personal-information-item" key={label}><span /><p>{label}<strong>{value}</strong></p></div>)}</div></section>

    <div className="profile-bottom-grid"><section className="profile-panel preferences-panel"><header><h2>Your preferences</h2><button onClick={openPreferencesEditor} type="button">Edit</button></header><PreferenceGroup title="Favorite cuisines" items={profile.favoriteCuisines} /><PreferenceGroup title="Dietary preferences" items={profile.dietaryPreferences} /><PreferenceGroup title="Disliked ingredients" items={profile.dislikedIngredients} /></section><section className="profile-panel notes-panel"><header><h2>Notes</h2><button onClick={openNotesEditor} type="button">Edit</button></header>{profile.notes ? <p className="saved-notes">{profile.notes}</p> : <div className="notes-lines"><span /><span /><span /><span /><span /></div>}</section></div>

    {modal === 'profile' && <Modal onClose={closeModal} title="Edit profile"><p>Update your personal information</p><div className="profile-form-grid">{[['fullName', 'Full name'], ['email', 'Email address'], ['location', 'Location'], ['memberSince', 'Member since'], ['cookingLevel', 'Cooking level'], ['weeklyGoal', 'Weekly goal']].map(([field, label]) => <label key={field}>{label}<input onChange={(event) => setProfileDraft({ ...profileDraft, [field]: event.target.value })} value={profileDraft[field]} /></label>)}</div><div className="modal-actions"><button onClick={closeModal} type="button">Cancel</button><button onClick={saveProfile} type="button">Save changes</button></div></Modal>}

    {modal === 'preferences' && <Modal onClose={closeModal} title="Edit preferences"><p>Choose your preferences to get more personalized recipes</p><h3>Favorite cuisines</h3><div className="choice-list">{cuisineOptions.map((item) => <button className={preferencesDraft.favoriteCuisines.includes(item) ? 'selected-choice' : ''} key={item} onClick={() => togglePreference('favoriteCuisines', item)} type="button">{item}</button>)}</div><h3>Dietary preferences</h3><div className="choice-list">{dietaryOptions.map((item) => <button className={preferencesDraft.dietaryPreferences.includes(item) ? 'selected-choice' : ''} key={item} onClick={() => togglePreference('dietaryPreferences', item)} type="button">{item}</button>)}</div><h3>Disliked ingredients</h3><div className="choice-list">{preferencesDraft.dislikedIngredients.map((item) => <span key={item}>{item}</span>)}<button className="add-more-button" onClick={() => { setIngredientsDraft(preferencesDraft.dislikedIngredients); setModal('ingredients') }} type="button"><Plus /> Add more</button></div><div className="modal-actions"><button onClick={closeModal} type="button">Cancel</button><button onClick={savePreferences} type="button">Save changes</button></div></Modal>}

    {modal === 'ingredients' && <Modal onClose={() => setModal('preferences')} title="Add more ingredients"><p>Choose ingredients you would like to include in your preferences</p><label className="ingredient-search"><Search /><input onChange={(event) => setIngredientSearch(event.target.value)} placeholder="Search ingredients..." value={ingredientSearch} /></label><div className="ingredient-options">{visibleProducts.map((product) => <button className={ingredientsDraft.includes(product.name) ? 'selected-ingredient' : ''} key={product.name} onClick={() => toggleIngredient(product.name)} type="button"><ProductIcon product={product} /><span>{product.name}</span></button>)}</div><div className="modal-actions"><button onClick={() => setModal('preferences')} type="button">Cancel</button><button onClick={saveIngredients} type="button">Add to preferences</button></div></Modal>}

    {modal === 'notes' && <Modal onClose={closeModal} title="Notes"><p>Add any notes, preferences or cooking tips</p><textarea maxLength="500" onChange={(event) => setNotesDraft(event.target.value)} value={notesDraft} /><div className="modal-actions"><button onClick={closeModal} type="button">Cancel</button><button onClick={saveNotes} type="button">Save changes</button></div></Modal>}
  </main>
}
