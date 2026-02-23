import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  menu_item_id: string
  name: string
  price: number
  quantity: number
  image_url: string
  is_veg: boolean
  restaurant_id: string
  restaurant_name: string
}

interface CartState {
  items: CartItem[]
  restaurant_id: string | null
  restaurant_name: string | null
}

const initialState: CartState = {
  items: [],
  restaurant_id: null,
  restaurant_name: null,
}

// Load cart from localStorage on initialization
function loadCartFromStorage(): CartState {
  const stored = localStorage.getItem('quickbite-cart')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return initialState
    }
  }
  return initialState
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      // Check if adding from different restaurant
      if (state.restaurant_id && state.restaurant_id !== action.payload.restaurant_id) {
        // Clear cart if switching restaurants
        state.items = []
      }

      // Set restaurant info
      state.restaurant_id = action.payload.restaurant_id
      state.restaurant_name = action.payload.restaurant_name

      // Check if item already exists
      const existingItem = state.items.find(
        (item) => item.menu_item_id === action.payload.menu_item_id
      )

      if (existingItem) {
        // Increase quantity
        existingItem.quantity += action.payload.quantity
      } else {
        // Add new item
        state.items.push(action.payload)
      }

      // Save to localStorage
      localStorage.setItem('quickbite-cart', JSON.stringify(state))
    },

    updateQuantity: (state, action: PayloadAction<{ menu_item_id: string; quantity: number }>) => {
      const item = state.items.find((item) => item.menu_item_id === action.payload.menu_item_id)
      if (item) {
        item.quantity = action.payload.quantity
        localStorage.setItem('quickbite-cart', JSON.stringify(state))
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.menu_item_id !== action.payload)

      // Clear restaurant info if cart is empty
      if (state.items.length === 0) {
        state.restaurant_id = null
        state.restaurant_name = null
      }

      localStorage.setItem('quickbite-cart', JSON.stringify(state))
    },

    clearCart: (state) => {
      state.items = []
      state.restaurant_id = null
      state.restaurant_name = null
      localStorage.removeItem('quickbite-cart')
    },
  },
})

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer