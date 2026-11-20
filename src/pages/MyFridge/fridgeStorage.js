export const fridgeStorageName = 'cookit.fridge-products'

export function getSavedProducts() {
  try {
    const savedProducts = JSON.parse(localStorage.getItem(fridgeStorageName))
    return Array.isArray(savedProducts) ? savedProducts : []
  } catch {
    return []
  }
}
