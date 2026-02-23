import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Restaurant {
  id: string
  owner_id: string
  name: string
  description: string
  address: string
  city: string
  image_url: string
  is_active: boolean
  rating: number
  created_at: string
  updated_at: string
}

interface RestaurantState {
  restaurants: Restaurant[]
  selectedRestaurant: Restaurant | null
  loading: boolean
  error: string | null
}

const initialState: RestaurantState = {
  restaurants: [],
  selectedRestaurant: null,
  loading: false,
  error: null,
}

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setRestaurants: (state, action: PayloadAction<Restaurant[]>) => {
      state.restaurants = action.payload
      state.loading = false
      state.error = null
    },
    setSelectedRestaurant: (state, action: PayloadAction<Restaurant | null>) => {
      state.selectedRestaurant = action.payload
    },
    addRestaurant: (state, action: PayloadAction<Restaurant>) => {
      state.restaurants.unshift(action.payload)
    },
    updateRestaurant: (state, action: PayloadAction<Restaurant>) => {
      const index = state.restaurants.findIndex(r => r.id === action.payload.id)
      if (index !== -1) {
        state.restaurants[index] = action.payload
      }
      if (state.selectedRestaurant?.id === action.payload.id) {
        state.selectedRestaurant = action.payload
      }
    },
    removeRestaurant: (state, action: PayloadAction<string>) => {
      state.restaurants = state.restaurants.filter(r => r.id !== action.payload)
      if (state.selectedRestaurant?.id === action.payload) {
        state.selectedRestaurant = null
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const {
  setRestaurants,
  setSelectedRestaurant,
  addRestaurant,
  updateRestaurant,
  removeRestaurant,
  setLoading,
  setError,
} = restaurantSlice.actions

export default restaurantSlice.reducer