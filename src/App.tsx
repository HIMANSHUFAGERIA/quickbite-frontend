import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './store/hook'
import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RestaurantsPage from './pages/RestaurantsPage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import RestaurantDashboard from './pages/RestaurantDashboard'
import CreateRestaurantPage from './pages/CreateRestaurantPage'
import EditRestaurantPage from './pages/EditRestaurantPage'
import ManageMenuPage from './pages/ManageMenuPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import MyOrdersPage from './pages/MyOrdersPage'
import RestaurantOrdersPage from './pages/RestaurantOrdersPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RestaurantsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/restaurant/:id"
        element={
          <ProtectedRoute>
            <RestaurantDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/order/:id"
        element={
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RestaurantDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/create-restaurant"
        element={
          <ProtectedRoute>
            <CreateRestaurantPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/edit-restaurant/:id"
        element={
          <ProtectedRoute>
            <EditRestaurantPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/manage-menu/:id"
        element={
          <ProtectedRoute>
            <ManageMenuPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/restaurant-orders/:id"
        element={
          <ProtectedRoute>
            <RestaurantOrdersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App