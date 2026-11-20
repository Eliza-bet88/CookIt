export const profileStorageName = 'cookit.user-profile'

export const defaultUserProfile = {
  fullName: 'User Name',
  email: 'user_name@gmail.com',
  location: 'Latvia, Riga',
  memberSince: 'May 2025',
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
