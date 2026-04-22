export interface CartItem {
  id: string // A unique ID for the cart item (e.g., productId-unitId-packageId)
  product: {
    id: number
    name: string
    slug: string
    image: string | null
  }
  unit: {
    id: number
    label: string
    price: number
  }
  pkg: {
    id: number
    name: string
    price: number
  } | null
  quantity: number
  totalPrice: number
}

export const useCart = () => {
  const cart = useCookie<CartItem[]>('dinosayurus-cart', {
    default: () => [],
    watch: true,
  })

  const cartItemCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + item.totalPrice, 0)
  })

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const itemId = `${item.product.id}-${item.unit.label}-${item.pkg?.name || 'none'}`
    const existingIndex = cart.value.findIndex(i => i.id === itemId)

    if (existingIndex > -1) {
      cart.value[existingIndex].quantity += item.quantity
      cart.value[existingIndex].totalPrice = cart.value[existingIndex].quantity * (item.unit.price + (item.pkg?.price || 0))
    } else {
      cart.value.push({
        ...item,
        id: itemId,
      })
    }
  }

  const removeFromCart = (itemId: string) => {
    cart.value = cart.value.filter(item => item.id !== itemId)
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    const item = cart.value.find(i => i.id === itemId)
    if (item && quantity > 0) {
      item.quantity = quantity
      item.totalPrice = quantity * (item.unit.price + (item.pkg?.price || 0))
    }
  }

  const clearCart = () => {
    cart.value = []
  }

  return {
    cart,
    cartItemCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }
}
