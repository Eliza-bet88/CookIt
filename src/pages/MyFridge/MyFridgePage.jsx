import { useState } from 'react'
import { Minus, Plus, Search, Trash, Xmark } from 'iconoir-react'
import ProductIcon from './ProductIcon'
import { productOptions } from './productOptions'

function mergeProducts(products, addedProducts) {
  const savedProducts = [...products]

  addedProducts.forEach((addedProduct) => {
    const existingIndex = savedProducts.findIndex(
      (product) => product.name === addedProduct.name
    )

    if (existingIndex === -1) {
      savedProducts.push(addedProduct)
      return
    }

    savedProducts[existingIndex] = {
      ...savedProducts[existingIndex],
      quantity: addedProduct.quantity,
      unit: addedProduct.unit,
    }
  })

  return savedProducts
}

function SelectedProductDetails({ product }) {
  if (!product) {
    return <p className="select-product-message">Choose a product from the list.</p>
  }

  return (
    <div className="selected-product-card">
      <ProductIcon product={product} />
      <div>
        <strong>{product.name}</strong>
        <span>{product.type}</span>
      </div>
    </div>
  )
}

export default function MyFridgePage({ products, onProductsChange }) {
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [addedProducts, setAddedProducts] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('pcs')

  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.trim().toLowerCase())
  )

  const visibleOptions = productOptions.filter((product) =>
    product.name.toLowerCase().includes(productSearch.trim().toLowerCase())
  )

  const productsForSummary = products
  const stockedPercentage = Math.min(
    Math.round((productsForSummary.length / productOptions.length) * 100),
    100
  )

  function openModal() {
    setIsModalOpen(true)
    setProductSearch('')
    setSelectedProduct(null)
    setAddedProducts([])
    setQuantity(1)
    setUnit('pcs')
  }

  function closeModal() {
    if (addedProducts.length > 0) {
      onProductsChange(mergeProducts(products, addedProducts))
    }

    setIsModalOpen(false)
  }

  function addProduct(event) {
    event.preventDefault()

    if (!selectedProduct || Number(quantity) <= 0) {
      return
    }

    const productIsAdded = addedProducts.some((product) => product.name === selectedProduct.name)

    if (productIsAdded) {
      const updatedProducts = []

      for (const product of addedProducts) {
        if (product.name === selectedProduct.name) {
          updatedProducts.push({ ...product, quantity: Number(quantity), unit })
        } else {
          updatedProducts.push(product)
        }
      }

      setAddedProducts(updatedProducts)
      return
    }

    const newProduct = {
      ...selectedProduct,
      id: Date.now(),
      quantity: Number(quantity),
      unit,
    }

    setAddedProducts([...addedProducts, newProduct])
    setSelectedProduct(newProduct)
  }

  function selectProduct(product) {
    const addedProduct = addedProducts.find((item) => item.name === product.name)
    let productToEdit = product
    let selectedQuantity = 1
    let selectedUnit = 'pcs'

    if (addedProduct) {
      productToEdit = addedProduct
      selectedQuantity = addedProduct.quantity
      selectedUnit = addedProduct.unit
    }

    setSelectedProduct(productToEdit)
    setQuantity(selectedQuantity)
    setUnit(selectedUnit)
  }

  function removeAddedProduct(id) {
    setAddedProducts(addedProducts.filter((product) => product.id !== id))

    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null)
      setQuantity(1)
      setUnit('pcs')
    }
  }

  function isProductAdded(product) {
    return products.some((item) => item.name === product.name)
      || addedProducts.some((item) => item.name === product.name)
  }

  function getProductButtonClass(product) {
    if (isProductAdded(product)) {
      return 'selected-product'
    }

    if (selectedProduct && selectedProduct.name === product.name) {
      return 'selected-product'
    }

    return ''
  }

  function getSaveButtonText() {
    if (!selectedProduct) {
      return 'Add'
    }

    const productWasAdded = addedProducts.some((product) => product.id === selectedProduct.id)

    if (productWasAdded) {
      return 'Save changes'
    }

    return 'Add'
  }

  function removeProduct(id) {
    onProductsChange(products.filter((product) => product.id !== id))
  }

  function changeQuantity(id, amount) {
    const updatedProducts = []

    for (const product of products) {
      if (product.id === id) {
        updatedProducts.push({
          ...product,
          quantity: Math.max(0.1, Number(product.quantity) + amount),
        })
      } else {
        updatedProducts.push(product)
      }
    }

    onProductsChange(updatedProducts)
  }

  return (
    <main className="fridge-page">
      <h1>My Fridge</h1>

      <div className="fridge-layout">
        <section className="fridge-products-section" aria-label="Products in your fridge">
          <div className="fridge-tools">
            <label className="fridge-search">
              <Search aria-hidden="true" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search products..."
              />
            </label>
            <button className="add-product-button" onClick={openModal} type="button">
              <Plus aria-hidden="true" />
              Add product
            </button>
          </div>

          <div className="fridge-product-list">
            {visibleProducts.map((product) => (
              <article className="fridge-product" key={product.id}>
                <ProductIcon product={product} />
                <p>{product.name}</p>
                <div className="product-quantity-controls">
                  <button aria-label={`Decrease ${product.name} quantity`} onClick={() => changeQuantity(product.id, -1)} type="button"><Minus aria-hidden="true" /></button>
                  <strong>{product.quantity} {product.unit}</strong>
                  <button aria-label={`Increase ${product.name} quantity`} onClick={() => changeQuantity(product.id, 1)} type="button"><Plus aria-hidden="true" /></button>
                </div>
                <button
                  aria-label={`Remove ${product.name}`}
                  className="remove-product-button"
                  onClick={() => removeProduct(product.id)}
                  type="button"
                >
                  <Trash aria-hidden="true" />
                </button>
              </article>
            ))}

            {visibleProducts.length === 0 && (
              <p className="fridge-empty-message">No products found.</p>
            )}
          </div>
        </section>

        <aside className="fridge-summary">
          <div className="fridge-summary-card">
            <h2>Your fridge</h2>
            <div
              className="fridge-count"
              style={{ '--stocked-percentage': `${stockedPercentage}%` }}
            >
              <div>
                <strong>{productsForSummary.length}</strong>
                <span>products</span>
              </div>
            </div>
          </div>
          <p>Your fridge is {stockedPercentage}% stocked.</p>
        </aside>
      </div>

      {isModalOpen && (
        <div className="add-product-backdrop" role="presentation">
          <section
            aria-labelledby="add-product-title"
            aria-modal="true"
            className="add-product-modal"
            role="dialog"
          >
            <header className="add-product-header">
              <h2 id="add-product-title">Add Product</h2>
              <button aria-label="Close" onClick={closeModal} type="button">
                <Xmark aria-hidden="true" />
              </button>
            </header>

            <form className="add-product-content" onSubmit={addProduct}>
              <div className="product-picker">
                {addedProducts.length > 0 && (
                  <div className="added-products" aria-label="Products ready to add">
                    {addedProducts.map((product) => (
                      <div className="added-product" key={product.id}>
                        <button onClick={() => selectProduct(product)} type="button">
                          <ProductIcon product={product} />
                          <span>{product.name}</span>
                          <strong>{product.quantity} {product.unit}</strong>
                        </button>
                        <button
                          aria-label={`Remove ${product.name}`}
                          onClick={() => removeAddedProduct(product.id)}
                          type="button"
                        >
                          <Xmark aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="fridge-search">
                  <Search aria-hidden="true" />
                  <input
                    autoFocus
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search product..."
                  />
                </label>

                <div className="product-options">
                  {visibleOptions.map((product) => (
                    <button
                      className={getProductButtonClass(product)}
                      key={product.name}
                      onClick={() => selectProduct(product)}
                      type="button"
                    >
                      <ProductIcon product={product} />
                      <span>{product.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="product-details">
                <h3>Selected product</h3>
                <SelectedProductDetails product={selectedProduct} />

                <label>
                  Quantity
                  <input
                    min="0.1"
                    onChange={(event) => setQuantity(event.target.value)}
                    step="0.1"
                    type="number"
                    value={quantity}
                  />
                </label>

                <label>
                  Unit
                  <select onChange={(event) => setUnit(event.target.value)} value={unit}>
                    <option value="pcs">pcs</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                  </select>
                </label>

                <button className="save-product-button" disabled={!selectedProduct} type="submit">
                  {getSaveButtonText()}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
