import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hook'
import { createRestaurant } from '../api/restaurant'
import { logout } from '../store/authSlice'

export default function CreateRestaurantPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { user } = useAppSelector((state) => state.auth)

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    image_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.address || !form.city) {
      setError('Name, address and city are required')
      return
    }

    setLoading(true)
    try {
      await createRestaurant(form)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create restaurant')
    } finally {
      setLoading(false)
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
              onClick={() => navigate('/dashboard')}
              className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              My Dashboard
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
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>

          <h2 className="text-3xl font-bold text-white mb-2">Create Restaurant</h2>
          <p className="text-gray-400">Add your restaurant details to get started</p>
        </div>

        {/* Form */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Restaurant Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Himalaya Restaurant"
                required
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Tell customers about your restaurant..."
                rows={4}
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g., 123 MG Road, Bandra West"
                required
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                City <span className="text-red-400">*</span>
              </label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Select City</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://example.com/restaurant-image.jpg"
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
              <p className="text-gray-500 text-xs mt-2">
                Optional: Paste a direct link to your restaurant's image
              </p>
            </div>

            {/* Image Preview */}
            {form.image_url && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preview</label>
                <div className="w-full h-48 bg-[#222] rounded-lg overflow-hidden">
                  <img
                    src={form.image_url}
                    alt="Restaurant preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-[#222] hover:bg-[#333] text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Creating...' : 'Create Restaurant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}