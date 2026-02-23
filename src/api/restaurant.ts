import { api } from './api'

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

interface CreateRestaurantData {
  name: string
  description: string
  address: string
  city: string
  image_url: string
}

interface UpdateRestaurantData {
  name: string
  description: string
  address: string
  city: string
  image_url: string
  is_active: boolean
}

export const getAllRestaurants = async (city?: string): Promise<Restaurant[]> => {
  const endpoint = city ? `/restaurants?city=${city}` : '/restaurants'
  return api.get<Restaurant[]>(endpoint)
}

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  return api.get<Restaurant>(`/restaurants/${id}`)
}

export const getMyRestaurants = async (): Promise<Restaurant[]> => {
  return api.get<Restaurant[]>('/restaurants/my/list')
}

export const createRestaurant = async (data: CreateRestaurantData): Promise<Restaurant> => {
  return api.post<Restaurant>('/restaurants', data)
}

export const updateRestaurant = async (
  id: string,
  data: UpdateRestaurantData
): Promise<{ message: string }> => {
  return api.put<{ message: string }>(`/restaurants/${id}`, data)
}

export const deleteRestaurant = async (id: string): Promise<{ message: string }> => {
  return api.delete<{ message: string }>(`/restaurants/${id}`)
}