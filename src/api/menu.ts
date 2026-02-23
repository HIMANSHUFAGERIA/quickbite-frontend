import { api } from './api'

interface MenuCategory {
  id: string
  restaurant_id: string
  name: string
  display_order: number
  created_at: string
}

interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string
  price: number
  image_url: string
  is_available: boolean
  is_veg: boolean
  created_at: string
  updated_at: string
}

interface CreateCategoryData {
  restaurant_id: string
  name: string
  display_order: number
}

interface CreateMenuItemData {
  category_id: string
  name: string
  description: string
  price: number
  image_url: string
  is_veg: boolean
}

interface UpdateMenuItemData {
  name: string
  description: string
  price: number
  image_url: string
  is_available: boolean
  is_veg: boolean
}

// ====== MENU CATEGORIES ======

export const getCategoriesByRestaurant = async (
  restaurantId: string
): Promise<MenuCategory[]> => {
  return api.get<MenuCategory[]>(`/restaurants/${restaurantId}/categories`)
}

export const createCategory = async (
  data: CreateCategoryData
): Promise<MenuCategory> => {
  return api.post<MenuCategory>('/menu/categories', data)
}

export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  return api.delete<{ message: string }>(`/menu/categories/${id}`)
}

// ====== MENU ITEMS ======

export const getMenuItemsByCategory = async (
  categoryId: string
): Promise<MenuItem[]> => {
  return api.get<MenuItem[]>(`/categories/${categoryId}/items`)
}

export const createMenuItem = async (
  data: CreateMenuItemData
): Promise<MenuItem> => {
  return api.post<MenuItem>('/menu/items', data)
}

export const updateMenuItem = async (
  id: string,
  data: UpdateMenuItemData
): Promise<{ message: string }> => {
  return api.put<{ message: string }>(`/menu/items/${id}`, data)
}

export const deleteMenuItem = async (id: string): Promise<{ message: string }> => {
  return api.delete<{ message: string }>(`/menu/items/${id}`)
}