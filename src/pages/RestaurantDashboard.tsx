import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hook'
import { setRestaurants, setLoading, setError } from '../store/restaurantSlice'
import { logout } from '../store/authSlice'
import { getMyRestaurants, deleteRestaurant } from '../api/restaurant'

export default function RestaurantDashboard() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { restaurants, loading, error } = useAppSelector((state) => state.restaurant)
  const { user } = useAppSelector((state) => state.auth)

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'restaurant_owner') {
      navigate('/')
      return
    }
    fetchMyRestaurants()
  }, [])

  const fetchMyRestaurants = async () => {
    dispatch(setLoading(true))
    try {
      const data = await getMyRestaurants()
      dispatch(setRestaurants(data))
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to fetch restaurants'))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRestaurant(id)
      await fetchMyRestaurants()
      setDeleteConfirm(null)
    } catch (err: any) {
      alert(err.message || 'Failed to delete restaurant')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Navbar */}
      <nav className="bg-[#141414] border-b border-[#222] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1
            onClick={() => navigate('/')}
            className="text-2xl font-black text-primary cursor-pointer hover:text-orange-500 transition-colors"
          >
            🍔 QuickBite
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              Welcome, <span className="text-white font-medium">{user?.name}</span>
            </span>

            <button
              onClick={() => navigate('/')}
              className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Browse Restaurants
            </button>

            <button
              onClick={handleLogout}
              className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">My Restaurants</h2>
            <p className="text-gray-400">Manage your restaurants and menus</p>
          </div>

          <button
            onClick={() => navigate('/dashboard/create-restaurant')}
            className="bg-primary hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + Add Restaurant
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading restaurants...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Restaurants List */}
        {!loading && !error && (
          <>
            {(restaurants || []).length === 0 ? (
              <div className="text-center py-12 bg-[#141414] border border-[#222] rounded-xl">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold text-white mb-2">No restaurants yet</h3>
                <p className="text-gray-400 mb-6">Create your first restaurant to get started</p>
                <button
                  onClick={() => navigate('/dashboard/create-restaurant')}
                  className="bg-primary hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  + Add Restaurant
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden"
                  >
                    {/* Restaurant Image */}
                    <div className="h-48 bg-[#222] overflow-hidden">
                      {restaurant.image_url ? (
                        <img
                          src={restaurant.image_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Restaurant Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">{restaurant.name}</h3>
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            restaurant.is_active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {restaurant.is_active ? 'Open' : 'Closed'}
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {restaurant.description || 'No description'}
                      </p>

                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-white font-medium">
                            {restaurant.rating.toFixed(1)}
                          </span>
                        </div>

                        <div className="text-gray-500">📍 {restaurant.city}</div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/edit-restaurant/${restaurant.id}`)}
                          className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => navigate(`/dashboard/manage-menu/${restaurant.id}`)}
                          className="bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Manage Menu
                        </button>
                      </div>

                      <button
                        onClick={() => navigate(`/dashboard/restaurant-orders/${restaurant.id}`)}
                        className="w-full mt-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Orders
                      </button>

                      <button
                        onClick={() => setDeleteConfirm(restaurant.id)}
                        className="w-full mt-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Delete Restaurant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-[#222] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Delete Restaurant?</h3>
            <p className="text-gray-400 mb-6">
              This will permanently delete the restaurant and all its menu items. This action cannot
              be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}