import { IconSalad } from '@tabler/icons-react'
import { productIcons } from './productOptions'

export default function ProductIcon({ product }) {
  let Icon = productIcons[product.icon]

  if (!Icon) {
    Icon = IconSalad
  }

  return (
    <span className="product-icon" aria-hidden="true">
      <Icon />
    </span>
  )
}
