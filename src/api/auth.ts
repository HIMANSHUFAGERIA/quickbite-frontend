import { api } from './api'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

interface AuthResponse {
  token: string
  user: User
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  role: string
}

interface LoginData {
  email: string
  password: string
}

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/auth/register', data)
}

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/auth/login', data)
}

export const getMe = async (): Promise<User> => {
  return api.get<User>('/auth/me')
}