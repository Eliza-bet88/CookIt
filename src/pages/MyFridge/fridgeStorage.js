export const fridgeStorageName = 'cookit.fridge-products'

export function getSavedProducts() {
  try {
    const savedProducts = JSON.parse(localStorage.getItem(fridgeStorageName))

    if (Array.isArray(savedProducts)) {
      return savedProducts
    }

    return []
  } catch {
    return []
  }
}
