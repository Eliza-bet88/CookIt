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
      setAddedProducts(
        addedProducts.map((product) =>
          product.name === selectedProduct.name
            ? { ...product, quantity: Number(quantity), unit }
            : product
        )
      )
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
    const productToEdit = addedProduct ?? product

    setSelectedProduct(productToEdit)
    setQuantity(addedProduct?.quantity ?? 1)
    setUnit(addedProduct?.unit ?? 'pcs')
  }

  function removeAddedProduct(id) {
    setAddedProducts(addedProducts.filter((product) => product.id !== id))

    if (selectedProduct?.id === id) {
      setSelectedProduct(null)
      setQuantity(1)
      setUnit('pcs')
    }
  }

  function isProductAdded(product) {
    return products.some((item) => item.name === product.name)
      || addedProducts.some((item) => item.name === product.name)
  }

  function removeProduct(id) {
    onProductsChange(products.filter((product) => product.id !== id))
  }

  function changeQuantity(id, amount) {
    onProductsChange(products.map((product) => (
      product.id === id
        ? { ...product, quantity: Math.max(0.1, Number(product.quantity) + amount) }
        : product
    )))
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
                      className={
                        isProductAdded(product) || selectedProduct?.name === product.name
                          ? 'selected-product'
                          : ''
                      }
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
                {selectedProduct ? (
                  <div className="selected-product-card">
                    <ProductIcon product={selectedProduct} />
                    <div>
                      <strong>{selectedProduct.name}</strong>
                      <span>{selectedProduct.type}</span>
                    </div>
                  </div>
                ) : (
                  <p className="select-product-message">Choose a product from the list.</p>
                )}

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
                  {addedProducts.some((product) => product.id === selectedProduct?.id)
                    ? 'Save changes'
                    : 'Add'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
