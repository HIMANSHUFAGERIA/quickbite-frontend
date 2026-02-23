import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hook'
import { updateQuantity, removeFromCart, clearCart } from '../store/cartSlice'
import { logout } from '../store/authSlice'

export default function CartPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { user } = useAppSelector((state) => state.auth)
  const cart = useAppSelector((state) => state.cart)

  const handleUpdateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(menuItemId))
    } else {
      dispatch(updateQuantity({ menu_item_id: menuItemId, quantity: newQuantity }))
    }
  }

  const handleRemove = (menuItemId: string) => {
    dispatch(removeFromCart(menuItemId))
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart())
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 50 // Fixed delivery fee
  const total = subtotal + deliveryFee

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
              onClick={() => navigate('/orders')}
              className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              My Orders
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

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Continue Shopping
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Shopping Cart</h2>
              {cart.restaurant_name && (
                <p className="text-gray-400">
                  Items from <span className="text-primary font-medium">{cart.restaurant_name}</span>
                </p>
              )}
            </div>

            {cart.items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Empty Cart State */}
        {cart.items.length === 0 ? (
          <div className="text-center py-16 bg-[#141414] border border-[#222] rounded-xl">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-6">Add some delicious items to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.menu_item_id}
                  className="bg-[#141414] border border-[#222] rounded-xl p-6"
                >
                  <div className="flex gap-4">
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

                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`w-2 h-2 rounded-sm ${
                                item.is_veg ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            ></span>
                            <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                          </div>
                          <p className="text-gray-400 text-sm">₹{item.price} each</p>
                        </div>

                        <button
                          onClick={() => handleRemove(item.menu_item_id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-[#0A0A0A] border border-[#333] rounded-lg">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.menu_item_id, item.quantity - 1)
                            }
                            className="px-4 py-2 text-white hover:text-primary transition-colors"
                          >
                            −
                          </button>
                          <span className="text-white font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.menu_item_id, item.quantity + 1)
                            }
                            className="px-4 py-2 text-white hover:text-primary transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-lg font-bold text-primary">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#141414] border border-[#222] rounded-xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-400">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-[#333] pt-3 flex justify-between text-white text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-primary hover:bg-orange-500 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate(`/restaurant/${cart.restaurant_id}`)}
                  className="w-full mt-3 bg-[#222] hover:bg-[#333] text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Add More Items
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}