import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hook'
import { clearCart } from '../store/cartSlice'
import { logout } from '../store/authSlice'
import { createOrder } from '../api/order'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { user } = useAppSelector((state) => state.auth)
  const cart = useAppSelector((state) => state.cart)

  const [form, setForm] = useState({
    delivery_address: '',
    payment_method: 'cash_on_delivery',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => {
    if (cart.items.length === 0 && !orderPlaced) { // ← ADD !orderPlaced
      navigate('/cart')
    }
  }, [cart.items.length, navigate, orderPlaced])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.delivery_address.trim()) {
      setError('Delivery address is required')
      return
    }

    setLoading(true)

    try {
      // Prepare order data
      const orderData = {
        restaurant_id: cart.restaurant_id!,
        items: cart.items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
        })),
        delivery_address: form.delivery_address,
        payment_method: form.payment_method,
      }

      // Create order
      const order = await createOrder(orderData)

      setOrderPlaced(true)

      // Clear cart
      dispatch(clearCart())

      // Redirect to order confirmation
      navigate(`/order/${order.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 50
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
            onClick={() => navigate('/cart')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Cart
          </button>

          <h2 className="text-3xl font-bold text-white mb-2">Checkout</h2>
          <p className="text-gray-400">
            Ordering from <span className="text-primary font-medium">{cart.restaurant_name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#141414] border border-[#222] rounded-xl p-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Delivery Address <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="delivery_address"
                    value={form.delivery_address}
                    onChange={handleChange}
                    placeholder="Enter your complete delivery address..."
                    rows={4}
                    required
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Include house number, street, landmark, and pincode
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Payment Method <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="payment_method"
                    value={form.payment_method}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="wallet">Wallet</option>
                  </select>
                  <p className="text-gray-500 text-xs mt-2">
                    Online payment integration coming soon. Cash on Delivery available now.
                  </p>
                </div>

                {/* Order Items Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div
                        key={item.menu_item_id}
                        className="flex items-center justify-between bg-[#0A0A0A] border border-[#333] rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2 h-2 rounded-sm ${
                              item.is_veg ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></span>
                          <div>
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-gray-500 text-sm">
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-white font-bold">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors"
                >
                  {loading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#141414] border border-[#222] rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Item Total ({cart.items.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>

                <div className="border-t border-[#333] pt-3 flex justify-between text-white text-lg font-bold">
                  <span>To Pay</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-[#333] rounded-lg p-4">
                <p className="text-gray-400 text-sm">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}