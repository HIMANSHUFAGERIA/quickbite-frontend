import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hook'
import { getOrderById } from '../api/order'
import { logout } from '../store/authSlice'

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

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { user } = useAppSelector((state) => state.auth)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchOrder()
    }
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const data = await getOrderById(id!)
      setOrder(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-blue-500/20 text-blue-400',
      preparing: 'bg-purple-500/20 text-purple-400',
      ready: 'bg-green-500/20 text-green-400',
      out_for_delivery: 'bg-orange-500/20 text-orange-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400'
  }

  const getStatusText = (status: string) => {
    const text: Record<string, string> = {
      pending: 'Order Pending',
      confirmed: 'Order Confirmed',
      preparing: 'Preparing Food',
      ready: 'Ready for Pickup',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    }
    return text[status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading order...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Home
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

            <button
              onClick={() => navigate('/orders')}
              className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              My Orders
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-white mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-400">
            Order ID: <span className="text-primary font-mono">{order.id}</span>
          </p>
        </div>

        {/* Order Status */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Order Status</h3>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Restaurant</p>
              <p className="text-white font-medium">{order.restaurant_name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Order Time</p>
              <p className="text-white font-medium">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Payment Method</p>
              <p className="text-white font-medium capitalize">
                {order.payment_method.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Payment Status</p>
              <p className="text-white font-medium capitalize">{order.payment_status}</p>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-3">Delivery Address</h3>
          <p className="text-gray-300">{order.delivery_address}</p>
        </div>

        {/* Order Items */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-[#0A0A0A] border border-[#333] rounded-lg p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#222] rounded-lg overflow-hidden flex-shrink-0">
                    {item.item_image ? (
                      <img
                        src={item.item_image}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍴
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-2 h-2 rounded-sm ${
                          item.is_veg ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></span>
                      <p className="text-white font-medium">{item.item_name}</p>
                    </div>
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

        {/* Bill Summary */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Bill Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-400">
              <span>Item Total</span>
              <span>₹{order.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Delivery Fee</span>
              <span>₹{order.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-[#333] pt-3 flex justify-between text-white text-lg font-bold">
              <span>Total Paid</span>
              <span className="text-primary">
                ₹{(order.total_amount + order.delivery_fee).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-[#222] hover:bg-[#333] text-white py-3 rounded-lg font-medium transition-colors"
          >
            Browse More Restaurants
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 bg-primary hover:bg-orange-500 text-white py-3 rounded-lg font-medium transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    </div>
  )
}