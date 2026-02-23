import { api } from './api'

interface OrderItem {
  menu_item_id: string
  quantity: number
}

interface CreateOrderData {
  restaurant_id: string
  items: OrderItem[]
  delivery_address: string
  payment_method: string
}

interface OrderItemWithMenu {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  price: number
  created_at: string
  item_name: string
  item_image: string
  is_veg: boolean
}

interface Order {
  id: string
  user_id: string
  restaurant_id: string
  status: string
  total_amount: number
  delivery_fee: number
  delivery_address: string
  payment_method: string
  payment_status: string
  created_at: string
  updated_at: string
  restaurant_name: string
  items: OrderItemWithMenu[]
}

export const createOrder = async (data: CreateOrderData): Promise<Order> => {
  return api.post<Order>('/orders', data)
}

export const getMyOrders = async (): Promise<Order[]> => {
  return api.get<Order[]>('/orders/my/list')
}

export const getOrderById = async (id: string): Promise<Order> => {
  return api.get<Order>(`/orders/${id}`)
}

export const cancelOrder = async (id: string): Promise<{ message: string }> => {
  return api.post<{ message: string }>(`/orders/${id}/cancel`)
}

export const getRestaurantOrders = async (restaurantId: string): Promise<Order[]> => {
  return api.get<Order[]>(`/restaurants/${restaurantId}/orders`)
}

export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<{ message: string }> => {
  return api.put<{ message: string }>(`/orders/${orderId}/status`, { status })
}