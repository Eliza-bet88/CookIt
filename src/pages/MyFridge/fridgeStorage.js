export function fridgeStorageName(userId) {
  return `cookit.${userId}.fridge-products`
}

export function getSavedProducts(userId) {
  try {
    const savedProducts = JSON.parse(localStorage.getItem(fridgeStorageName(userId)))

    if (Array.isArray(savedProducts)) {
      return savedProducts
    }

    return []
  } catch {
    return []
  }
}
