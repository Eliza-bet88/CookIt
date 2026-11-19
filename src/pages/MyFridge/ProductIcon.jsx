import { IconSalad } from '@tabler/icons-react'
import { productIcons } from './productOptions'

export default function ProductIcon({ product }) {
  const Icon = productIcons[product.icon] ?? IconSalad

  return (
    <span className="product-icon" aria-hidden="true">
      <Icon />
    </span>
  )
}
