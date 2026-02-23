import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hook'
import { getMyOrders, cancelOrder } from '../api/order'
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

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { user } = useAppSelector((state) => state.auth)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await getMyOrders()
      setOrders(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      await cancelOrder(orderId)
      await fetchOrders() // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order')
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
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    }
    return text[status] || status
  }

  const canCancel = (status: string) => {
    return status === 'pending' || status === 'confirmed'
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-white mb-8">My Orders</h2>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16 bg-[#141414] border border-[#222] rounded-xl">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Start ordering delicious food!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Restaurants
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-[#222]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {order.restaurant_name}
                      </h3>
                      <p className="text-gray-500 text-sm font-mono">
                        Order ID: {order.id}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Items</p>
                        <p className="text-white font-medium">{order.items.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Total</p>
                        <p className="text-white font-medium">
                          ₹{(order.total_amount + order.delivery_fee).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Payment</p>
                        <p className="text-white font-medium capitalize">
                          {order.payment_method.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/order/${order.id}`)}
                        className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>

                      {canCancel(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-[#0A0A0A] border border-[#333] rounded-lg p-3"
                      >
                        <div className="w-12 h-12 bg-[#222] rounded-lg overflow-hidden flex-shrink-0">
                          {item.item_image ? (
                            <img
                              src={item.item_image}
                              alt={item.item_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              🍴
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-sm flex-shrink-0 ${
                                item.is_veg ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            ></span>
                            <p className="text-white text-sm font-medium truncate">
                              {item.item_name}
                            </p>
                          </div>
                          <p className="text-gray-500 text-xs">
                            ₹{item.price} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}