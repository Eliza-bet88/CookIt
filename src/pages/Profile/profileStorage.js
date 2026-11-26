export function profileStorageName(userId) {
  return `cookit.${userId}.user-profile`
}

export function getDefaultUserProfile(email) {
  return {
    fullName: 'User',
    email,
    location: '',
    memberSince: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()),
    cookingLevel: '',
    weeklyGoal: '',
    favoriteCuisines: [],
    dietaryPreferences: [],
    dislikedIngredients: [],
    notes: '',
  }
}

export function getSavedUserProfile(userId, email) {
  const defaultUserProfile = getDefaultUserProfile(email)

  try {
    const savedProfile = JSON.parse(localStorage.getItem(profileStorageName(userId)))

    if (savedProfile) {
      return { ...defaultUserProfile, ...savedProfile }
    }

    return defaultUserProfile
  } catch {
    return defaultUserProfile
  }
}
