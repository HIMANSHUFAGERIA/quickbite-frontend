import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hook'
import { setRestaurants, setLoading, setError } from '../store/restaurantSlice'
import { getAllRestaurants } from '../api/restaurant'
import { logout } from '../store/authSlice'

export default function RestaurantsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { restaurants, loading, error } = useAppSelector((state) => state.restaurant)
  const { user } = useAppSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  useEffect(() => {
    fetchRestaurants()
  }, [cityFilter])

  const fetchRestaurants = async () => {
    dispatch(setLoading(true))
    try {
      const data = await getAllRestaurants(cityFilter || undefined)
      dispatch(setRestaurants(data))
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to fetch restaurants'))
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const filteredRestaurants = (restaurants || []).filter((restaurant) =>
  restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
)

  return (
    <div className="min-h-screen bg-dark">
      {/* Navbar */}
      <nav className="bg-[#141414] border-b border-[#222] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-primary">🍔 QuickBite</h1>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              Welcome, <span className="text-white font-medium">{user?.name}</span>
            </span>

              <button
                onClick={() => navigate('/orders')}
                className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                My Orders
              </button>
            
            {user?.role === 'restaurant_owner' && (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                My Dashboard
              </button>
            )}
            
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Browse Restaurants</h2>
          <p className="text-gray-400">Discover amazing food from local restaurants</p>
        </div>

        {/* Filters */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Search by name</label>
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Filter by city</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
          </div>
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

        {/* Restaurants Grid */}
        {!loading && !error && (
          <>
            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No restaurants found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden hover:border-primary transition-all cursor-pointer group"
                  >
                    {/* Restaurant Image */}
                    <div className="h-48 bg-[#222] overflow-hidden">
                      {restaurant.image_url ? (
                        <img
                          src={restaurant.image_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Restaurant Info */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {restaurant.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {restaurant.description || 'No description available'}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-white font-medium">
                            {restaurant.rating.toFixed(1)}
                          </span>
                        </div>

                        <div className="text-gray-500">
                          📍 {restaurant.city}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )

  // return (
  //   <>
  //     <h1>Helo</h1>
  //   </>
  // )
}