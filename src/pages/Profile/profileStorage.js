export const profileStorageName = 'cookit.user-profile'

export const defaultUserProfile = {
  fullName: 'User Name',
  email: 'user_name@gmail.com',
  location: 'Latvia, Riga',
  memberSince: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()),
  cookingLevel: 'Beginner',
  weeklyGoal: '5 times a week',
  favoriteCuisines: [],
  dietaryPreferences: [],
  dislikedIngredients: [],
  notes: '',
}

export function getSavedUserProfile() {
  try {
    const savedProfile = JSON.parse(localStorage.getItem(profileStorageName))
    return savedProfile ? { ...defaultUserProfile, ...savedProfile } : defaultUserProfile
  } catch {
    return defaultUserProfile
  }
}
