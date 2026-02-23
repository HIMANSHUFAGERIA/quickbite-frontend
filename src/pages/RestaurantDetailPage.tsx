import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hook'
import { setSelectedRestaurant } from '../store/restaurantSlice'
import { addToCart } from '../store/cartSlice'
import { getRestaurantById } from '../api/restaurant'
import { getCategoriesByRestaurant, getMenuItemsByCategory } from '../api/menu'
import { logout } from '../store/authSlice'

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

interface CategoryWithItems extends MenuCategory {
  items: MenuItem[]
}

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { selectedRestaurant } = useAppSelector((state) => state.restaurant)
  const { user } = useAppSelector((state) => state.auth)
  const cart = useAppSelector((state) => state.cart)

  const [categories, setCategories] = useState<CategoryWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCartConflict, setShowCartConflict] = useState(false)
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    if (id) {
      fetchRestaurantAndMenu()
    }
  }, [id])

  const fetchRestaurantAndMenu = async () => {
    setLoading(true)
    setError('')
    try {
      const restaurant = await getRestaurantById(id!)
      dispatch(setSelectedRestaurant(restaurant))

      const categoriesData = await getCategoriesByRestaurant(id!)

      const categoriesWithItems = await Promise.all(
        categoriesData.map(async (category) => {
          const items = await getMenuItemsByCategory(category.id)
          return { ...category, items }
        })
      )

      setCategories(categoriesWithItems)
    } catch (err: any) {
      setError(err.message || 'Failed to load restaurant')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (item: MenuItem) => {
    // Check if cart has items from different restaurant
    if (cart.restaurant_id && cart.restaurant_id !== id) {
      setPendingItem(item)
      setShowCartConflict(true)
      return
    }

    // Add to cart
    dispatch(
      addToCart({
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image_url: item.image_url,
        is_veg: item.is_veg,
        restaurant_id: id!,
        restaurant_name: selectedRestaurant?.name || '',
      })
    )
  }

  const handleClearAndAdd = () => {
    if (pendingItem) {
      // Clear cart and add new item
      dispatch(
        addToCart({
          menu_item_id: pendingItem.id,
          name: pendingItem.name,
          price: pendingItem.price,
          quantity: 1,
          image_url: pendingItem.image_url,
          is_veg: pendingItem.is_veg,
          restaurant_id: id!,
          restaurant_name: selectedRestaurant?.name || '',
        })
      )
      setShowCartConflict(false)
      setPendingItem(null)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const getItemQuantityInCart = (itemId: string): number => {
    const cartItem = cart.items.find((item) => item.menu_item_id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading restaurant...</p>
        </div>
      </div>
    )
  }

  if (error || !selectedRestaurant) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Restaurant not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    )
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

            {/* Cart Button */}
            <button
              onClick={() => navigate('/cart')}
              className="relative bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🛒 Cart
              {cart.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {cart.items.length}
                </span>
              )}
            </button>

            {user?.role === 'restaurant_owner' && (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm transition-colors"
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

      {/* Restaurant Header */}
      <div className="bg-[#141414] border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Restaurants
          </button>

          <div className="flex items-start gap-6">
            {/* Restaurant Image */}
            <div className="w-32 h-32 bg-[#222] rounded-xl overflow-hidden flex-shrink-0">
              {selectedRestaurant.image_url ? (
                <img
                  src={selectedRestaurant.image_url}
                  alt={selectedRestaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  🍽️
                </div>
              )}
            </div>

            {/* Restaurant Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-black text-white mb-2">
                {selectedRestaurant.name}
              </h1>
              <p className="text-gray-400 mb-4">
                {selectedRestaurant.description || 'No description available'}
              </p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-white font-medium">
                    {selectedRestaurant.rating.toFixed(1)}
                  </span>
                </div>

                <div className="text-gray-400">
                  📍 {selectedRestaurant.address}, {selectedRestaurant.city}
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRestaurant.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {selectedRestaurant.is_active ? '🟢 Open' : '🔴 Closed'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Menu</h2>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No menu available yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="bg-[#141414] border border-[#222] rounded-xl p-6">
                {/* Category Header */}
                <h3 className="text-xl font-bold text-primary mb-4">{category.name}</h3>

                {/* Menu Items */}
                {category.items.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items in this category</p>
                ) : (
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-4 p-4 bg-[#0A0A0A] rounded-lg border border-[#222] ${
                          !item.is_available ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Item Image */}
                        <div className="w-24 h-24 bg-[#222] rounded-lg overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              🍴
                            </div>
                          )}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-3 h-3 rounded-sm ${
                                  item.is_veg ? 'bg-green-500' : 'bg-red-500'
                                }`}
                              ></span>
                              <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                            </div>

                            <p className="text-lg font-bold text-primary">₹{item.price}</p>
                          </div>

                          <p className="text-gray-400 text-sm mb-3">
                            {item.description || 'No description'}
                          </p>

                          {!item.is_available ? (
                            <span className="text-red-400 text-xs font-medium">Not Available</span>
                          ) : (
                            <div className="flex items-center gap-3">
                              {getItemQuantityInCart(item.id) > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-sm">
                                    In cart: {getItemQuantityInCart(item.id)}
                                  </span>
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    className="bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    Add More
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddToCart(item)}
                                  className="bg-primary hover:bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Conflict Modal */}
      {showCartConflict && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-[#222] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Replace cart items?</h3>
            <p className="text-gray-400 mb-6">
              Your cart contains items from <span className="text-primary font-medium">{cart.restaurant_name}</span>. 
              Do you want to clear your cart and add items from <span className="text-primary font-medium">{selectedRestaurant.name}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCartConflict(false)
                  setPendingItem(null)
                }}
                className="flex-1 bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAndAdd}
                className="flex-1 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}