import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hook'
import { getRestaurantById } from '../api/restaurant'
import {
  getCategoriesByRestaurant,
  createCategory,
  deleteCategory,
  getMenuItemsByCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../api/menu'
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

export default function ManageMenuPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { user } = useAppSelector((state) => state.auth)

  const [restaurantName, setRestaurantName] = useState('')
  const [categories, setCategories] = useState<CategoryWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryForm, setCategoryForm] = useState({ name: '', display_order: 1 })

  // Item form
  const [showItemForm, setShowItemForm] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_veg: false,
    is_available: true,
  })

  useEffect(() => {
    if (id) {
      fetchRestaurantAndMenu()
    }
  }, [id])

  const fetchRestaurantAndMenu = async () => {
    setLoading(true)
    try {
      const restaurant = await getRestaurantById(id!)
      setRestaurantName(restaurant.name)

      const categoriesData = await getCategoriesByRestaurant(id!)

      const categoriesWithItems = await Promise.all(
        categoriesData.map(async (category) => {
          const items = await getMenuItemsByCategory(category.id)
          return { ...category, items }
        })
      )

      setCategories(categoriesWithItems)
    } catch (err: any) {
      setError(err.message || 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCategory({
        restaurant_id: id!,
        name: categoryForm.name,
        display_order: categoryForm.display_order,
      })
      setCategoryForm({ name: '', display_order: categories.length + 1 })
      setShowCategoryForm(false)
      await fetchRestaurantAndMenu()
    } catch (err: any) {
      alert(err.message || 'Failed to create category')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Delete this category and all its items?')) return
    try {
      await deleteCategory(categoryId)
      await fetchRestaurantAndMenu()
    } catch (err: any) {
      alert(err.message || 'Failed to delete category')
    }
  }

  const openItemForm = (categoryId: string, item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setItemForm({
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        is_veg: item.is_veg,
        is_available: item.is_available,
      })
    } else {
      setEditingItem(null)
      setItemForm({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        is_veg: false,
        is_available: true,
      })
    }
    setShowItemForm(categoryId)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, itemForm)
      } else {
        await createMenuItem({
          category_id: showItemForm!,
          ...itemForm,
        })
      }
      setShowItemForm(null)
      setEditingItem(null)
      await fetchRestaurantAndMenu()
    } catch (err: any) {
      alert(err.message || 'Failed to save item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this menu item?')) return
    try {
      await deleteMenuItem(itemId)
      await fetchRestaurantAndMenu()
    } catch (err: any) {
      alert(err.message || 'Failed to delete item')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading menu...</p>
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Manage Menu</h2>
              <p className="text-gray-400">{restaurantName}</p>
            </div>

            <button
              onClick={() => setShowCategoryForm(true)}
              className="bg-primary hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              + Add Category
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Categories and Items */}
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-[#141414] border border-[#222] rounded-xl">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">No categories yet</h3>
            <p className="text-gray-400 mb-6">Create your first category to start adding menu items</p>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="bg-primary hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              + Add Category
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-[#141414] border border-[#222] rounded-xl p-6">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-primary">{category.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openItemForm(category.id)}
                      className="bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      + Add Item
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete Category
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                {!category.items || category.items.length === 0  ? (
                  <p className="text-gray-500 text-sm">No items yet. Click "Add Item" to get started.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(category.items || []).map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#0A0A0A] border border-[#222] rounded-lg p-4"
                      >
                        <div className="flex gap-4">
                          {/* Item Image */}
                          <div className="w-20 h-20 bg-[#222] rounded-lg overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                🍴
                              </div>
                            )}
                          </div>

                          {/* Item Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-sm ${
                                    item.is_veg ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                ></span>
                                <h4 className="font-semibold text-white">{item.name}</h4>
                              </div>
                            </div>

                            <p className="text-gray-400 text-xs mb-2 line-clamp-1">
                              {item.description || 'No description'}
                            </p>

                            <div className="flex items-center justify-between">
                              <p className="text-primary font-bold">₹{item.price}</p>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  item.is_available
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {item.is_available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => openItemForm(category.id, item)}
                                className="flex-1 bg-[#222] hover:bg-[#333] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
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

      {/* Add Category Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-[#222] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Add Category</h3>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g., Starters, Main Course, Desserts"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Display Order</label>
                <input
                  type="number"
                  value={categoryForm.display_order}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) })
                  }
                  min="1"
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-[#222] rounded-xl p-6 max-w-md w-full my-8">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingItem ? 'Edit Item' : 'Add Item'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Item Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g., Paneer Tikka"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Describe the dish..."
                  rows={3}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Image URL</label>
                <input
                  type="url"
                  value={itemForm.image_url}
                  onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_veg}
                    onChange={(e) => setItemForm({ ...itemForm, is_veg: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white text-sm">Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_available}
                    onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white text-sm">Available</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemForm(null)
                    setEditingItem(null)
                  }}
                  className="flex-1 bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}